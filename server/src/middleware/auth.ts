import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ── Middleware: verifica el JWT en el header Authorization ────
// Uso: router.get('/ruta-protegida', authenticate, controller)

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // El token viene así:  Authorization: Bearer eyJhbGci...
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };

    // Inyectar el userId en el request para que los controllers lo usen
    (req as any).userId = decoded.id;
    (req as any).userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ── Middleware: solo permite acceso a admins ──────────────────
// Uso: router.delete('/producto', authenticate, isAdmin, controller)
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req as any).userRole !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado — solo administradores' });
  }
  next();
}
