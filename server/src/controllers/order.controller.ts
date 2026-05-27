import type { Request, Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

// ── POST /api/orders ──────────────────────────────────────────
// Crea una nueva orden a partir del carrito del usuario
export async function createOrder(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { items, shippingAddress } = req.body as {
      items: Array<{ productId: string; quantity: number }>;
      shippingAddress: { street: string; city: string; state: string; zip: string };
    };

    // Construir items con snapshot de precios actuales
    let subtotal = 0;
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

        // Reducir stock de forma atómica
        await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );

        subtotal += product.priceNumber * item.quantity;

        return {
          productId: product._id,
          slug:      product.slug,
          name:      product.name,     // snapshot — no cambia si sube el precio después
          price:     product.priceNumber,
          image:     product.image,
          quantity:  item.quantity,
        };
      })
    );

    const shipping = subtotal >= 200 ? 0 : 50; // envío gratis sobre $200
    const total = subtotal + shipping;

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      shipping,
      total,
      shippingAddress,
    });

    // Vaciar el carrito tras la compra
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creando orden' });
  }
}

// ── GET /api/orders ───────────────────────────────────────────
// Historial de órdenes del usuario autenticado
export async function getMyOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const orders = await Order
      .find({ userId })
      .sort({ createdAt: -1 }); // más recientes primero

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando órdenes' });
  }
}

// ── GET /api/orders/:id ───────────────────────────────────────
// Detalle de una orden específica
export async function getOrderById(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const order = await Order.findOne({
      _id: req.params.id,
      userId,             // solo puede ver sus propias órdenes
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando orden' });
  }
}
