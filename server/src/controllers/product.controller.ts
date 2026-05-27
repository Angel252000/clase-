import type { Request, Response } from 'express';
import Product from '../models/Product.js';

// ── GET /api/products ─────────────────────────────────────────
// Devuelve todos los productos activos ordenados por su posición en el scroll
export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await Product
      .find({ isActive: true })
      .sort({ order: 1 });             // orden ascendente = mismo orden del showcase

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando productos' });
  }
}

// ── GET /api/products/:slug ───────────────────────────────────
// Devuelve un producto por su slug ("fresa", "chocolate", etc.)
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando producto' });
  }
}

// ── PUT /api/products/:slug/stock ─────────────────────────────
// Reduce el stock de forma atómica al confirmar una orden
export async function reduceStock(req: Request, res: Response) {
  try {
    const { quantity } = req.body as { quantity: number };

    // $inc es atómico — no hay race conditions con múltiples compras simultáneas
    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug, stock: { $gte: quantity } },  // solo si hay stock suficiente
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    res.json({ message: 'Stock actualizado', stock: product.stock });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando stock' });
  }
}
