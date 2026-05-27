import { Router } from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Todas las rutas del carrito requieren estar autenticado
router.use(authenticate);

// GET    /api/cart           → ver carrito
// POST   /api/cart           → agregar producto
// DELETE /api/cart/:itemId   → eliminar un item
// DELETE /api/cart           → vaciar todo el carrito

router.get('/',          getCart);
router.post('/',         addToCart);
router.delete('/:itemId', removeFromCart);
router.delete('/',       clearCart);

export default router;
