import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// ── Cargar .env PRIMERO antes de todo ────────────────────────
dotenv.config();

// ── Conexión MongoDB ──────────────────────────────────────────
import connectDB from './config/db.js';

// ── Rutas ─────────────────────────────────────────────────────
import productRoutes from './routes/products.routes.js';
import authRoutes    from './routes/auth.routes.js';
import cartRoutes    from './routes/cart.routes.js';
import orderRoutes    from './routes/orders.routes.js';
import paymentRoutes  from './routes/payments.routes.js';

// ── Error handler global ──────────────────────────────────────
import { errorHandler } from './middleware/errorHandler.js';

// Conectar a MongoDB (no bloquea el servidor si falla)
connectDB().catch((err) => {
  console.warn('⚠️  MongoDB no conectó — las órdenes no se guardarán:', err.message);
});

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  // Acepta cualquier puerto de localhost en desarrollo
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'success', message: '🍦 CREAMY API running' });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/products', productRoutes);   // GET /api/products, /api/products/:slug
app.use('/api/auth',     authRoutes);      // POST /api/auth/register, /login, GET /me
app.use('/api/cart',     cartRoutes);      // GET/POST/DELETE /api/cart
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);     // GET/POST /api/orders

// ── Error handler (siempre al final) ─────────────────────────
app.use(errorHandler);

// ── Arrancar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
