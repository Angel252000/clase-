import { Router } from 'express';
import {
  createPaymentIntent,
  confirmOrder,
} from '../controllers/payment.controller.js';

const router = Router();

// POST /api/payments/create-intent
// Crea un PaymentIntent en Stripe → devuelve clientSecret + paymentIntentId
router.post('/create-intent', createPaymentIntent);

// POST /api/payments/confirm-order
// Verifica el pago con Stripe → guarda la orden en MongoDB
router.post('/confirm-order', confirmOrder);

export default router;
