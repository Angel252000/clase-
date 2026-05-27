import mongoose, { Schema, Document } from 'mongoose';

// ── Tipos TypeScript ──────────────────────────────────────────
export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    addedAt: Date;
  }>;
}

// ── Schema Mongoose ───────────────────────────────────────────
const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,   // un solo carrito por usuario
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity:  { type: Number, min: 1, default: 1 },
        addedAt:   { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', cartSchema);
