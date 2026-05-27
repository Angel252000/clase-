import mongoose, { Schema, Document } from 'mongoose';

// ── Sub-schema: snapshot del producto al momento de comprar ───
const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
  slug:      { type: String, required: true },
  name:      { type: String, required: true },   // snapshot — precio fijo
  price:     { type: Number, required: true },   // snapshot del precio exacto
  image:     { type: String, default: '' },
  quantity:  { type: Number, required: true, min: 1 },
}, { _id: false });

// ── Interface TypeScript ──────────────────────────────────────
export interface IOrder extends Document {
  // Usuario (opcional — soporta guest checkout)
  userId?: mongoose.Types.ObjectId;
  customerName:  string;
  customerEmail: string;

  // Items
  items: Array<{
    productId?: mongoose.Types.ObjectId;
    slug:      string;
    name:      string;
    price:     number;
    image:     string;
    quantity:  number;
  }>;

  // Montos
  subtotal: number;
  shipping: number;
  total:    number;

  // Estado
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

  // Stripe
  stripePaymentIntentId: string;

  // Dirección
  shippingAddress: {
    street: string;
    city:   string;
    zip:    string;
  };
}

// ── Schema Mongoose ───────────────────────────────────────────
const orderSchema = new Schema<IOrder>(
  {
    // Soporte para usuarios registrados Y guests
    userId:        { type: Schema.Types.ObjectId, ref: 'User', default: null },
    customerName:  { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },

    items:    { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total:    { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'paid', // si llegó aquí, Stripe ya lo confirmó
    },

    stripePaymentIntentId: { type: String, required: true, unique: true },

    shippingAddress: {
      street: { type: String, default: '' },
      city:   { type: String, default: '' },
      zip:    { type: String, default: '' },
    },
  },
  {
    timestamps: true, // createdAt = fecha de la compra
  }
);

// Índices para búsquedas comunes
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 }, { unique: true });

export default mongoose.model<IOrder>('Order', orderSchema);
