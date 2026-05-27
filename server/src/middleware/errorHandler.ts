import type { Request, Response, NextFunction } from 'express';

// ── Middleware: manejo global de errores ──────────────────────
// Se registra AL FINAL en index.ts: app.use(errorHandler)
// Captura cualquier error que se pase con next(error)

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`❌ [${req.method}] ${req.path} →`, err.message);

  // Error de clave duplicada en MongoDB (ej: email ya registrado)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    return res.status(409).json({ error: `El ${field} ya está en uso` });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Error genérico
  res.status(500).json({ error: 'Error interno del servidor' });
}
