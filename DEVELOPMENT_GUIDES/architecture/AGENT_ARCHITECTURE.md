# 🏛️ ARCHITECTURE AGENT  ⭐ CRÍTICO DE ESTRUCTURA
> SOLID · Clean Architecture · DDD · Design Patterns · TypeScript

---

## ¿Por qué soy crítico de ESTRUCTURA?

Soy el agente que evita que el código se convierta en **código espagueti**.
Sin mí, el Frontend y el Backend funcionan — pero en 3 meses nadie
entiende el código, todo está acoplado y añadir una feature rompe dos.

**Úsame ANTES de escribir un módulo importante.**
**Úsame cuando el código ya existe y ya no se puede mantener.**

```
SIN MÍ:                              CONMIGO:
─────────────────────────────────    ──────────────────────────────────
Todo en un archivo de 800 líneas  →  Capas separadas, cada una con su rol
Controller habla directo con DB   →  Controller → Service → Repository
Cambiar un feature rompe 5 cosas  →  Cambias 1 capa, el resto no sabe
Nadie sabe dónde va el código     →  Carpetas con responsabilidad clara
```

---

## ¿Cuándo me llamas?

- Vas a crear un **módulo nuevo** y no sabes cómo organizarlo
- El código existe pero es **difícil de mantener** (refactoring)
- Necesitas aplicar **SOLID** a una clase o módulo
- No sabes qué **patrón de diseño** usar
- Quieres separar las capas: **dominio, aplicación, infraestructura**
- Quieres modelar el negocio con **DDD** (Entities, Value Objects, etc.)

---

## Cómo pedirme algo — Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : Architecture  ⭐
🎯 NECESITO    : [diseñar / refactorizar / elegir patrón]
📋 CONTEXTO    : [qué hace este módulo / cuál es el problema]
📊 RESTRICCIONES: [qué no puede romperse, tech stack]
✅ ENTREGAR    : [estructura de carpetas / interfaces / ejemplos]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Ejemplo real — diseño:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : Architecture  ⭐
🎯 NECESITO    : Diseñar módulo de pagos desde cero
📋 CONTEXTO    : Maneja: crear pago, confirmar, reembolsar, historial.
                Actualmente todo está en un solo archivo payments.ts
📊 RESTRICCIONES: No romper los endpoints actuales
✅ ENTREGAR    : Carpetas + interfaces clave + ejemplo de Entity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Ejemplo real — refactor:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : Architecture  ⭐
🎯 NECESITO    : Refactorizar UserService que viola SOLID
📋 CONTEXTO    : UserService tiene 400 líneas: valida, hashea password,
                envía email, guarda en DB y genera el JWT. Todo junto.
📊 RESTRICCIONES: La API externa no cambia (mismos endpoints)
✅ ENTREGAR    : Clases separadas + diagrama de dependencias
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Las 4 capas que siempre uso

```
┌──────────────────────────────────────────────┐
│  PRESENTATION  (HTTP, Controllers, Routes)   │  ← Recibe y responde
├──────────────────────────────────────────────┤
│  APPLICATION   (Use Cases, Services)         │  ← Orquesta la lógica
├──────────────────────────────────────────────┤
│  DOMAIN        (Entities, Value Objects)     │  ← Las reglas de negocio
├──────────────────────────────────────────────┤
│  INFRASTRUCTURE (DB, APIs externas, Email)   │  ← Los detalles técnicos
└──────────────────────────────────────────────┘

Regla de dependencia:
  Las capas de arriba dependen de las de abajo.
  Las capas de abajo NO conocen a las de arriba.
  El DOMAIN no depende de nadie.
```

### Estructura de carpetas que produce esta arquitectura

```
server/src/
├── presentation/
│   ├── routes/           ← Solo rutas Express
│   └── controllers/      ← Solo recibe Request, devuelve Response
│
├── application/
│   ├── use-cases/        ← CreateUser, GetOrder, CancelPayment…
│   └── services/         ← Orquesta use cases si comparten lógica
│
├── domain/
│   ├── entities/         ← User.ts, Order.ts, Payment.ts
│   ├── value-objects/    ← Email.ts, Money.ts, UserId.ts
│   └── repositories/     ← INTERFACES (IUserRepository, IOrderRepository)
│
└── infrastructure/
    ├── database/         ← Implementación Prisma de los repositorios
    ├── email/            ← Nodemailer, SendGrid, etc.
    └── external/         ← APIs de terceros (Stripe, Twilio…)
```

---

## Los 5 principios SOLID — explicados con código

### S — Single Responsibility (Una responsabilidad por clase)

```typescript
// ❌ MAL — UserService hace demasiado
class UserService {
  async register(data: RegisterDTO) {
    const hash = await bcrypt.hash(data.password, 10)  // hashear
    const user = await prisma.user.create({ data })     // persistir
    await mailer.send({ to: data.email, subject: '...' }) // enviar email
    return jwt.sign({ id: user.id }, SECRET)            // generar token
  }
}

// ✅ BIEN — cada clase hace UNA cosa
class PasswordHasher {
  hash(plain: string)    { return bcrypt.hash(plain, 10) }
  compare(plain, hashed) { return bcrypt.compare(plain, hashed) }
}

class UserRepository {
  create(data: CreateUserDTO) { return prisma.user.create({ data }) }
}

class WelcomeMailer {
  send(email: string) { return mailer.send({ to: email, subject: '...' }) }
}

class TokenGenerator {
  generate(userId: string) { return jwt.sign({ id: userId }, SECRET) }
}

class RegisterUserUseCase {
  constructor(
    private hasher: PasswordHasher,
    private repo: UserRepository,
    private mailer: WelcomeMailer,
    private tokens: TokenGenerator
  ) {}

  async execute(data: RegisterDTO) {
    const password = await this.hasher.hash(data.password)
    const user     = await this.repo.create({ ...data, password })
    await this.mailer.send(data.email)
    return this.tokens.generate(user.id)
  }
}
```

---

### O — Open/Closed (Abierto a extensión, cerrado a modificación)

```typescript
// ❌ MAL — cada nuevo medio de pago rompe la función
function processPayment(method: string, amount: number) {
  if (method === 'stripe')  { /* lógica stripe */ }
  if (method === 'paypal')  { /* lógica paypal */ }
  if (method === 'crypto')  { /* lógica nueva → modifica esta función */ }
}

// ✅ BIEN — cada nuevo pago EXTIENDE sin modificar
interface PaymentGateway {
  charge(amount: number): Promise<{ id: string }>
}

class StripeGateway  implements PaymentGateway { charge = ... }
class PaypalGateway  implements PaymentGateway { charge = ... }
class CryptoGateway  implements PaymentGateway { charge = ... }  // ← nuevo, no toca lo anterior

class PaymentService {
  constructor(private gateway: PaymentGateway) {}
  pay(amount: number) { return this.gateway.charge(amount) }
}
```

---

### L — Liskov Substitution (Los subtipos deben poder reemplazar al padre)

```typescript
// ✅ Cualquier StorageAdapter puede reemplazar a otro
interface StorageAdapter {
  upload(file: Buffer, name: string): Promise<string>  // devuelve URL
  delete(name: string): Promise<void>
}

class S3Storage    implements StorageAdapter { ... }
class LocalStorage implements StorageAdapter { ... }  // para tests

// El servicio no sabe cuál usa — ambos cumplen el contrato
class FileService {
  constructor(private storage: StorageAdapter) {}
  async saveAvatar(file: Buffer, userId: string) {
    return this.storage.upload(file, `avatars/${userId}`)
  }
}
```

---

### I — Interface Segregation (Interfaces específicas, no gigantes)

```typescript
// ❌ MAL — una interfaz que hace demasiado
interface UserRepository {
  findById(id: string): Promise<User>
  create(data: CreateUserDTO): Promise<User>
  sendWelcomeEmail(email: string): Promise<void>  // ← no es responsabilidad del repo
  generateReport(): Promise<Buffer>               // ← tampoco
}

// ✅ BIEN — cada interfaz tiene un propósito
interface IUserReader {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
}

interface IUserWriter {
  create(data: CreateUserDTO): Promise<User>
  update(id: string, data: Partial<User>): Promise<User>
  delete(id: string): Promise<void>
}

// Quien solo lee, solo implementa IUserReader
```

---

### D — Dependency Inversion (Depende de abstracciones, no de implementaciones)

```typescript
// ❌ MAL — Application layer conoce el detalle de infraestructura
class GetUserUseCase {
  async execute(id: string) {
    return prisma.user.findUnique({ where: { id } })  // ← acoplado a Prisma
  }
}

// ✅ BIEN — la abstracción en el medio
// domain/repositories/IUserRepository.ts
interface IUserRepository {
  findById(id: string): Promise<User | null>
}

// application/use-cases/GetUserUseCase.ts
class GetUserUseCase {
  constructor(private repo: IUserRepository) {}  // ← depende de la interfaz
  execute(id: string) { return this.repo.findById(id) }
}

// infrastructure/database/PrismaUserRepository.ts
class PrismaUserRepository implements IUserRepository {
  findById(id: string) { return prisma.user.findUnique({ where: { id } }) }
}
```

---

## Entity y Value Object (DDD básico)

```typescript
// ── ENTITY: tiene identidad propia ─────────────────────────
// domain/entities/User.ts
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,      // Value Object
    public name: string,
    public readonly createdAt: Date
  ) {}

  static create(email: string, name: string): User {
    if (name.trim().length < 2) throw new Error('Nombre muy corto')
    return new User(crypto.randomUUID(), new Email(email), name, new Date())
  }

  changeName(newName: string): void {
    if (newName.trim().length < 2) throw new Error('Nombre muy corto')
    this.name = newName
  }
}

// ── VALUE OBJECT: sin identidad, definido por su valor ──────
// domain/value-objects/Email.ts
export class Email {
  readonly value: string

  constructor(raw: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      throw new Error(`Email inválido: ${raw}`)
    }
    this.value = raw.toLowerCase()
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
```

---

## Los 3 patrones que más usarás

### Repository (acceso a datos desacoplado)
```typescript
// ← El domain define el contrato
interface IProductRepository {
  findById(id: string): Promise<Product | null>
  findAll(filters: ProductFilters): Promise<Product[]>
  save(product: Product): Promise<void>
  delete(id: string): Promise<void>
}

// ← La infraestructura lo implementa
class PrismaProductRepository implements IProductRepository {
  async findById(id: string) {
    const row = await prisma.product.findUnique({ where: { id } })
    return row ? toDomain(row) : null       // mapea de DB a Entity
  }
  // ...resto
}
```

### Factory (crear objetos complejos)
```typescript
// Centraliza la lógica de creación
class OrderFactory {
  static create(items: OrderItem[], userId: string): Order {
    if (items.length === 0) throw new Error('La orden necesita items')
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    return new Order(crypto.randomUUID(), userId, items, total, 'pending')
  }
}

// Uso
const order = OrderFactory.create(cartItems, currentUser.id)
```

### Strategy (algoritmos intercambiables)
```typescript
interface DiscountStrategy {
  calculate(price: number): number
}

class NoDiscount     implements DiscountStrategy { calculate = (p) => p }
class PercentDiscount implements DiscountStrategy {
  constructor(private pct: number) {}
  calculate = (p: number) => p * (1 - this.pct / 100)
}
class FlatDiscount   implements DiscountStrategy {
  constructor(private amount: number) {}
  calculate = (p: number) => Math.max(0, p - this.amount)
}

class PriceCalculator {
  constructor(private strategy: DiscountStrategy) {}
  final(price: number) { return this.strategy.calculate(price) }
}

// Uso
const vip      = new PriceCalculator(new PercentDiscount(20))
const newcomer = new PriceCalculator(new FlatDiscount(500))
```

---

## Checklist — antes de dar por terminado

```
[ ] Cada clase tiene UNA razón para cambiar (S)
[ ] Nuevo comportamiento se agrega extendiendo, no modificando (O)
[ ] Las interfaces son específicas, no genéricas (I)
[ ] Las capas altas dependen de interfaces, no de implementaciones (D)
[ ] Las Entities no importan nada de Express ni Prisma
[ ] Los repositorios son interfaces en domain/, implementaciones en infra/
[ ] Puedo cambiar Prisma por otro ORM sin tocar el dominio
[ ] Los tests del dominio no necesitan base de datos
```

---

## Tips para dominarme

| # | Tip | Por qué importa |
|---|-----|----------------|
| 1 | **Diseña el dominio antes de la DB** | Las tablas deben seguir al modelo, no al revés |
| 2 | **Entity = identidad, Value Object = valor** | `User` tiene id. `Email` solo tiene su cadena. |
| 3 | **Una interfaz por "capacidad"** | `IUserReader`, `IUserWriter` — no una sola gigante |
| 4 | **Los Use Cases son los verbos del negocio** | `CreateUser`, `PlaceOrder`, `CancelPayment` |
| 5 | **El domain no conoce Express ni Prisma** | Si lo hace, Architecture falla |
| 6 | **Refactoriza en pequeños pasos** | Un principio a la vez, no todo a la vez |
| 7 | **Un patrón solo cuando el problema existe** | No uses Factory si tienes un objeto simple |

**Ejercicio para dominarlo:** Toma un `UserService` de 200+ líneas existente, aplica S (separa responsabilidades) y D (extrae una interfaz `IUserRepository`). Mide: ¿cuántas clases salieron?

---

## Mi relación con los otros 3 agentes

```
🏛️ ARCHITECTURE  define las interfaces y la estructura
        │
        ├──→  🗄️ BACKEND implementa esas interfaces (Repository, Service)
        │
        ├──→  🎨 FRONTEND consume los Use Cases a través de la API
        │
        └──→  🚀 DEVOPS despliega todo — no cambia la estructura
```

**Regla:** Cuando dudes en cómo organizar código → Architecture primero.
Cuando el diseño esté claro → llama a Backend o Frontend para implementar.

---

*Última revisión: 2026-05-22*
