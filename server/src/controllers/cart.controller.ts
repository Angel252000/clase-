import type { Request, Response } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// ── GET /api/cart ─────────────────────────────────────────────
// Obtiene el carrito del usuario con los datos completos del producto
export async function getCart(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const cart = await Cart
      .findOne({ userId })
      .populate('items.productId', 'slug name price priceNumber theme image');

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando carrito' });
  }
}

// ── POST /api/cart ────────────────────────────────────────────
// Agrega o actualiza un producto en el carrito
export async function addToCart(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { productId, quantity } = req.body as { productId: string; quantity: number };

    // Verificar que el producto existe y tiene stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // upsert: crea el carrito si no existe, si existe agrega el item
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, quantity } } },
      { upsert: true, new: true }
    ).populate('items.productId', 'slug name price priceNumber theme image');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error agregando al carrito' });
  }
}

// ── DELETE /api/cart/:itemId ──────────────────────────────────
// Elimina un item del carrito por su _id dentro del array
export async function removeFromCart(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando item del carrito' });
  }
}

// ── DELETE /api/cart ──────────────────────────────────────────
// Vacía el carrito completo (después de una orden exitosa)
export async function clearCart(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
    res.json({ message: 'Carrito vaciado' });
  } catch (error) {
    res.status(500).json({ error: 'Error vaciando carrito' });
  }
}
