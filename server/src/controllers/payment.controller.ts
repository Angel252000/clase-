import type { Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';

// ── Stripe lazy init (dotenv ya cargó cuando se llama) ────────
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY no configurado en .env');
  return new Stripe(key);
}

// ─────────────────────────────────────────────────────────────
// POST /api/payments/create-intent
// Body: { amount, currency?, productName, customerName, customerEmail }
// → Crea el PaymentIntent en Stripe y devuelve el clientSecret
// ─────────────────────────────────────────────────────────────
export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const {
      amount,
      currency     = 'usd',
      productName,
      customerName,
      customerEmail,
    } = req.body as {
      amount:        number;
      currency?:     string;
      productName?:  string;
      customerName?: string;
      customerEmail?:string;
    };

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100), // Stripe trabaja en centavos
      currency,
      metadata: {
        productName:   productName   || '',
        customerName:  customerName  || '',
        customerEmail: customerEmail || '',
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('❌ Stripe createIntent error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/payments/confirm-order
// Body: { paymentIntentId, items, shippingAddress, customerInfo }
// → Verifica el pago con Stripe → guarda la orden en MongoDB
// ─────────────────────────────────────────────────────────────
export async function confirmOrder(req: Request, res: Response) {
  try {
    const {
      paymentIntentId,
      items,
      shippingAddress,
      customerInfo,
    } = req.body as {
      paymentIntentId: string;
      customerInfo: {
        name:    string;
        email:   string;
      };
      shippingAddress: {
        street: string;
        city:   string;
        zip:    string;
      };
      items: Array<{
        slug:     string;
        name:     string;
        price:    number;
        quantity: number;
        image?:   string;
      }>;
    };

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'paymentIntentId requerido' });
    }

    // ── 1. Verificar el pago directamente con Stripe ──────────
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') {
      return res.status(402).json({
        error: `Pago no completado. Estado Stripe: ${intent.status}`,
      });
    }

    // ── 2. Evitar duplicados (idempotencia) ───────────────────
    const existing = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    if (existing) {
      return res.status(200).json({ order: existing, duplicate: true });
    }

    // ── 3. Calcular totales ───────────────────────────────────
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = 0; // envío gratis

    // ── 4. Guardar orden en MongoDB ───────────────────────────
    const order = await Order.create({
      customerName:  customerInfo.name,
      customerEmail: customerInfo.email,
      items: items.map(i => ({
        slug:     i.slug,
        name:     i.name,
        price:    i.price,
        quantity: i.quantity,
        image:    i.image || '',
      })),
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: 'paid',
      stripePaymentIntentId: paymentIntentId,
      shippingAddress,
    });

    console.log(`✅ Orden guardada: ${order._id} | ${customerInfo.email} | ₡${subtotal}`);

    res.status(201).json({ order });
  } catch (error: any) {
    console.error('❌ confirmOrder error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
