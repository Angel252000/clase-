import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── POST /api/auth/register ───────────────────────────────────
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    // Verificar si el email ya existe
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Este email ya está registrado' });
    }

    // Crear usuario (el pre-save hook hashea el password automáticamente)
    const user = await User.create({ name, email, password });

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

// ── POST /api/auth/login ──────────────────────────────────────
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Comparar password con el hash guardado
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────
// Devuelve el perfil del usuario autenticado (necesita middleware auth)
export async function getMe(req: Request, res: Response) {
  try {
    // req.userId viene del middleware auth.ts
    const user = await User.findById((req as any).userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
}
