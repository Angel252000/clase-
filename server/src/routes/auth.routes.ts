import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register   → crea cuenta
// POST /api/auth/login      → inicia sesión, devuelve JWT
// GET  /api/auth/me         → perfil del usuario (requiere token)

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        authenticate, getMe);

export default router;
