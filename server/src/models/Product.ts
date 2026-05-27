import mongoose, { Schema, Document } from 'mongoose';

// ── Tipos TypeScript ──────────────────────────────────────────
export interface IProduct extends Document {
  slug: string;           // "fresa" — usado en la URL /products/fresa
  name: string;           // "Fresa"
  tagline: string;        // "El Deleite Rosado"
  price: string;          // "$65 MXN" — formato visual
  priceNumber: number;    // 65 — para cálculos
  theme: string;          // "#e84e72" — color hex del producto
  bgText: string;         // "FRESA" — texto gigante de fondo
  description: string;
  modelType: 'icecream' | 'cone' | 'popsicle' | 'cup' | 'softserve';
  image: string;          // URL de imagen PNG fondo transparente
  ingredients: string[];
  benefits: string[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  size: string;           // "120ml"
  origin: string;         // "México"
  rating: number;
  reviewsCount: number;
  isNewProduct: boolean;
  isBestSeller: boolean;
  stock: number;
  isActive: boolean;
  order: number;          // posición en el scroll showcase
}

// ── Schema Mongoose ───────────────────────────────────────────
const productSchema = new Schema<IProduct>(
  {
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:         { type: String, required: true, trim: true },
    tagline:      { type: String, default: '' },
    price:        { type: String, required: true },           // "$65 MXN"
    priceNumber:  { type: Number, required: true, min: 0 },   // 65
    theme:        { type: String, required: true },            // color hex
    bgText:       { type: String, default: '' },
    description:  { type: String, default: '' },
    modelType:    {
      type: String,
      enum: ['icecream', 'cone', 'popsicle', 'cup', 'softserve'],
      default: 'popsicle',
    },
    image:        { type: String, default: '' },
    ingredients:  [{ type: String }],
    benefits:     [{ type: String }],
    nutrition: {
      calories: { type: Number, default: 0 },
      protein:  { type: Number, default: 0 },
      fat:      { type: Number, default: 0 },
      carbs:    { type: Number, default: 0 },
    },
    size:         { type: String, default: '120ml' },
    origin:       { type: String, default: 'México' },
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    isNewProduct: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    stock:        { type: Number, default: 100, index: true },
    isActive:     { type: Boolean, default: true },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true } // agrega createdAt y updatedAt automáticamente
);

export default mongoose.model<IProduct>('Product', productSchema);
