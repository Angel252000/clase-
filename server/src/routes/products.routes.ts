import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  reduceStock,
} from '../controllers/product.controller.js';

const router = Router();

// GET /api/products           → lista todos los activos ordenados
// GET /api/products/:slug     → detalle de uno ("fresa", "chocolate"...)
// PUT /api/products/:slug/stock → reduce stock al comprar (uso interno)

router.get('/',              getAllProducts);
router.get('/:slug',         getProductBySlug);
router.put('/:slug/stock',   reduceStock);

export default router;
