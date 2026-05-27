import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Tipos TypeScript ──────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ── Schema Mongoose ───────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    phone:    { type: String, default: '' },
    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      zip:     { type: String, default: '' },
      country: { type: String, default: 'CR' },
    },
  },
  { timestamps: true }
);

// ── Hash password antes de guardar ────────────────────────────
userSchema.pre('save', async function () {
  // Solo hashea si el password fue modificado
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Método para comparar password en login ────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
