# 🗄️ BACKEND AGENT
> Express · TypeScript · MongoDB · Mongoose · Zod

---

## ¿Cuándo me llamas?
Cuando la tarea vive **en el servidor o en la base de datos**:
- Crear o modificar un **endpoint** (GET, POST, PUT, DELETE)
- **Base de datos**: nueva colección, validaciones de esquema, relación, índice
- **Validación** de datos de entrada (Zod o Mongoose)
- **Autenticación** (JWT, hash de passwords con bcrypt)
- **Optimización** de queries (select, lean, índices)
- **Tests** de rutas o servicios

---

## Cómo pedirme algo — Template

```
📌 AGENTE      : Backend
🎯 NECESITO    : [endpoint / feature / fix de BD]
📂 STACK       : Express + TypeScript + MongoDB + Mongoose
📋 DETALLES    : [body esperado, lógica, restricciones]
📊 VALIDACIONES: [reglas de negocio]
✅ ENTREGAR    : [route + controller + schema + test]
```

**Ejemplo real:**
```
📌 AGENTE      : Backend
🎯 NECESITO    : POST /api/auth/register
📂 STACK       : Express + Mongoose + bcrypt + JWT
📋 DETALLES    : Body: { name, email, password }
                Verifica que el email no exista.
                Hashea el password. Devuelve JWT.
📊 VALIDACIONES: email válido, password min 6 chars
✅ ENTREGAR    : route + controller + schema Mongoose + test
```

---

## Estructura de carpetas que uso

```
server/src/
├── config/          ← Conexión a BD (db.ts)
├── routes/          ← Define las URLs  (auth.routes.ts)
├── controllers/     ← Recibe Request, interactúa con Mongoose, devuelve Response
├── models/          ← Schemas de Mongoose (Product.ts, User.ts)
├── middleware/      ← auth, errorHandler
├── utils/           ← Helpers
└── types/           ← Tipos globales TypeScript
```

### Flujo de una petición
```
Request → Route → Middleware (auth) → Controller (llama a Mongoose Models) → DB
                                                                             ↓
Response ←──────────────────────────────────────── Controller ←──────────────┘
```

---

## Mis patrones base

### Conexión DB
```typescript
// config/db.ts
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### Schema Mongoose
```typescript
// models/User.ts
import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
}

const userSchema = new Schema<IUser>({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

export default mongoose.model<IUser>('User', userSchema)
```

### Route + Controller
```typescript
// routes/users.routes.ts
import { Router } from 'express'
import { getUser, createUser } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/me',  authenticate, getUser)
router.post('/',   createUser)

export default router
```

```typescript
// controllers/user.controller.ts
import { Request, Response } from 'express'
import User from '../models/User.js'

export async function createUser(req: Request, res: Response) {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error: any) {
    if (error.code === 11000) {             // MongoDB: duplicate key
      return res.status(409).json({ error: 'Email ya en uso' })
    }
    res.status(500).json({ error: 'Error interno' })
  }
}
```

---

## Checklist — antes de dar por terminado

```
[ ] Ruta registrada en el router principal (`index.ts`)
[ ] Schema de Mongoose estrictamente tipado (IInterface extends Document)
[ ] Nunca devuelvo el campo `password` en la respuesta (usar `.select('-password')`)
[ ] Errores de MongoDB manejados (code 11000 = unique constraint)
[ ] Variables de entorno en .env, no hardcodeadas
```

---

## Métricas que debo cumplir

| Qué | Meta |
|-----|------|
| Tiempo de respuesta API | < 200 ms |
| Test coverage | > 80 % |
| Campos sensibles expuestos | 0 |
| Errores sin manejar | 0 |

---

## Tips para dominarme

1. **`.select('-password')` siempre** al hacer GET de usuarios en Mongoose para no filtrar contraseñas.
2. **Utiliza `populate`** inteligentemente, no hagas n+1 requests. Si necesitas solo un campo usa `.populate('campo', 'nombre email')`.
3. **Mongoose Errors** → `11000` = duplicate key, ValidationError = 400 Bad Request.
4. **Nunca pongas lógica en las rutas**, solo mounting y middleware. Todos los metodos van en controllers.
5. **Aprovecha `lean()`** en queries donde solo leas (GET) para mejorar rendimiento dramáticamente.

---

*Última revisión: 2026-05-25 (Migrado a MongoDB/Mongoose)*

