import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Todas las rutas de órdenes requieren estar autenticado
router.use(authenticate);

// POST /api/orders        → crear orden desde el carrito
// GET  /api/orders        → historial del usuario
// GET  /api/orders/:id    → detalle de una orden

router.post('/',    createOrder);
router.get('/',     getMyOrders);
router.get('/:id',  getOrderById);

export default router;
