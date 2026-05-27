# 📖 GUÍA MAESTRA — Cómo dominar los 4 Agentes

> Esta es la única guía que necesitas leer. Todo lo demás son los archivos de cada agente.

---

## Los 4 Agentes y su rol

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  🎨 FRONTEND       🗄️ BACKEND       🚀 DEVOPS ⭐      🏛️ ARCHITECTURE ⭐    │
│  ─────────────     ────────────     ──────────────    ──────────────────   │
│  Lo que se ve      Lo que procesa   Lo que lo lleva   Cómo está organizado  │
│  React, Tailwind   Express, Prisma  a producción      SOLID, Clean Arch     │
│  Componentes       APIs, Base datos Docker, CI/CD     DDD, Patrones         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**La cadena de valor:**
```
Architecture diseña  →  Backend implementa  →  Frontend consume  →  DevOps despliega
```

---

## Cómo invocar cualquier agente — Template único

Copia este bloque, rellena los campos y pégalo al chatear con el agente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : [Frontend | Backend | DevOps ⭐ | Architecture ⭐]
🎯 NECESITO    : [1 línea específica]
📂 STACK       : [tus tecnologías actuales]
📋 DETALLES    : [comportamiento esperado]
📊 RESTRICCIONES: [qué no debe hacer]
✅ ENTREGAR    : [archivos o resultado concreto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4 Ejemplos — uno por agente

### 🎨 Frontend
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : Frontend
🎯 NECESITO    : Formulario de login con validación visual
📂 STACK       : React 19 + TypeScript + Tailwind + React Hook Form
📋 DETALLES    : Campos: email y password.
                Error inline bajo cada campo.
                Loading spinner en el botón al submit.
📊 RESTRICCIONES: Sin librerías de UI externas (solo Tailwind)
✅ ENTREGAR    : LoginForm.tsx + tipos + test básico
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 🗄️ Backend
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : Backend
🎯 NECESITO    : Endpoint GET /api/products con filtros
📂 STACK       : Express + TypeScript + Prisma + PostgreSQL
📋 DETALLES    : Query params: category, minPrice, maxPrice, inStock.
                Paginación: page y limit (default 20).
                Ordenar por: price, createdAt.
📊 RESTRICCIONES: Solo devolver productos activos (isActive: true)
✅ ENTREGAR    : route + controller + service + test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 🚀 DevOps ⭐
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : DevOps ⭐
🎯 NECESITO    : CI + CD para monorepo frontend/backend
🖥️  PLATAFORMA : GitHub Actions → Vercel + Railway
📋 DETALLES    : CI: lint + test + build en cada PR.
                CD: deploy a staging en push a develop,
                    deploy a prod en push a main (solo si CI verde).
📊 RESTRICCIONES: Secrets en GitHub Secrets. Nunca en código.
✅ ENTREGAR    : ci.yml + deploy.yml + .env.example actualizado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 🏛️ Architecture ⭐
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 AGENTE      : Architecture ⭐
🎯 NECESITO    : Diseñar módulo de pagos desde cero
📋 CONTEXTO    : Maneja: crear pago, confirmar, reembolsar, historial.
                Actualmente todo está en un solo archivo payments.ts
📊 RESTRICCIONES: No romper los endpoints actuales
✅ ENTREGAR    : Carpetas + interfaces clave + ejemplo de Entity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📚 Tips para dominar cada agente

### 🎨 Dominar FRONTEND

| # | Tip | Por qué importa |
|---|-----|----------------|
| 1 | **Componente = props + render, nada más** | Si tiene fetch o setTimeout, sácalo a un hook |
| 2 | **Nombra el estado por lo que ES, no por lo que hace** | `isLoading` ✅ · `doLoader` ❌ |
| 3 | **Mobile-first en Tailwind** | `text-sm md:text-base` → empieza siempre desde el móvil |
| 4 | **Un componente, un archivo, un test** | Si el archivo pasa de 150 líneas, divídelo |
| 5 | **GSAP en `useLayoutEffect`, no en `useEffect`** | Evita el flash visual en el montaje |
| 6 | **Exporta tipos junto al componente** | `export type { ButtonProps }` en el mismo archivo |
| 7 | **Usa `React.memo` solo si puedes medirlo** | No lo apliques por defecto, solo si hay lag real |

**Ejercicio para dominarlo:** Crea 5 componentes atómicos (Button, Input, Badge, Spinner, Avatar) y luego ensámblalos en una Card de usuario.

---

### 🗄️ Dominar BACKEND

| # | Tip | Por qué importa |
|---|-----|----------------|
| 1 | **Controller delgado, Service gordo** | El controller solo recibe y responde. La lógica va en el service |
| 2 | **Zod valida, Prisma persiste** | Son capas distintas. No uses Prisma para validar |
| 3 | **Nunca devuelvas el password** | Usa `select: { password: false }` en toda query |
| 4 | **Aprende los códigos de error de Prisma** | P2002=unique · P2025=not found → mapéalos a HTTP |
| 5 | **Los índices son gratis hasta que no lo son** | Agrégalos cuando una query supere 100ms |
| 6 | **Env vars desde el inicio** | `process.env.DATABASE_URL` desde el primer día, nunca hardcoded |
| 7 | **Test el happy path Y el error path** | Un test que solo pasa el caso feliz no protege nada |

**Ejercicio para dominarlo:** Implementa CRUD completo de una entidad (ej: `Product`) con validación Zod, manejo de errores Prisma y tests.

---

### 🚀 Dominar DEVOPS ⭐ (el crítico de producción)

| # | Tip | Por qué importa |
|---|-----|----------------|
| 1 | **CI antes de escribir código** | Si el pipeline no existe, nadie sabe si el código funciona |
| 2 | **Dockerfile multi-stage siempre** | La imagen runtime no necesita devDependencies ni código fuente |
| 3 | **Un secret en git = comprometido para siempre** | Cambia todas las claves si esto pasa |
| 4 | **Conventional Commits no son opcionales** | Permiten changelogs automáticos y blame útil |
| 5 | **Main debe estar deployable en todo momento** | Nada va a main sin pasar por PR + CI verde |
| 6 | **`docker-compose up` debe funcionar en frío** | Un dev nuevo debe levantar el proyecto sin ayuda |
| 7 | **Rollback = rama anterior, no código nuevo** | Nunca "arregles" un bug urgente en prod con un hotfix sin CI |

**Ejercicio para dominarlo:** Configura un pipeline que: corra tests → haga build → deploya a staging automáticamente en cada push a `develop`.

---

### 🏛️ Dominar ARCHITECTURE ⭐ (el crítico de estructura)

| # | Tip | Por qué importa |
|---|-----|----------------|
| 1 | **Diseña el dominio antes de la DB** | Las tablas deben seguir al modelo, no al revés |
| 2 | **Entity = identidad, Value Object = valor** | `User` tiene id. `Email` solo tiene su cadena. |
| 3 | **Una interfaz por "capacidad"** | `IUserReader`, `IUserWriter` — no una sola gigante |
| 4 | **Los Use Cases son los verbos del negocio** | `CreateUser`, `PlaceOrder`, `CancelPayment` |
| 5 | **El domain no conoce Express ni Prisma** | Si lo hace, Architecture falla |
| 6 | **Refactoriza en pequeños pasos** | Un principio a la vez, no todo a la vez |
| 7 | **Un patrón solo cuando el problema existe** | No uses Factory si tienes un objeto simple |

**Ejercicio para dominarlo:** Toma un `UserService` de 200+ líneas, aplica S (separa responsabilidades) y D (extrae una interfaz `IUserRepository`). Mide: ¿cuántas clases salieron?

---

## 🔄 Flujo de trabajo diario con los 4 agentes

```
ANTES DE ESCRIBIR CÓDIGO
  └─ ¿Módulo nuevo o estructura compleja?
  └─ Architecture primero → define capas e interfaces
  └─ Backend y Frontend implementan sobre esa base

LUNES — Planificación
  └─ ¿Qué features entran esta semana?
  └─ Architecture valida que el diseño sea sólido
  └─ Backend define los endpoints (contrato de API)
  └─ Frontend mocka los datos mientras Backend implementa
  └─ DevOps ya tiene el CI listo desde la semana anterior

DURANTE LA SEMANA
  └─ Ramas: feat/[nombre] → develop (no a main directamente)
  └─ CI corre en cada push → si falla, lo arreglas antes de seguir
  └─ PR con descripción: qué cambia y por qué

VIERNES — Release
  └─ Merge a main → CI verde → CD deploya automáticamente
  └─ Verifica en staging antes de prod
  └─ Si hay problema → revierte la rama, no commitees el arreglo directo
```

---

## 🚦 Señales de que estás usando el agente equivocado

| Señal | Agente correcto |
|-------|----------------|
| Hablas de `useState`, `useEffect`, Tailwind | 🎨 Frontend |
| Hablas de `prisma.create`, `router.post`, Zod | 🗄️ Backend |
| Hablas de `docker build`, `.yml`, Vercel/Railway | 🚀 DevOps |
| Hablas de "el botón no se ve bien" | 🎨 Frontend |
| Hablas de "la query tarda mucho" | 🗄️ Backend |
| Hablas de "el deploy falló" | 🚀 DevOps |
| Hablas de SOLID, capas, acoplamiento, refactor | 🏛️ Architecture |
| Hablas de "el código es un desastre y nadie lo entiende" | 🏛️ Architecture |
| Hablas de "no sé dónde va este código" | 🏛️ Architecture |

---

## ❌ Los 8 errores más comunes

```
ERROR 1: Llamar a Frontend para una ruta de Express
  → Si es del servidor, es Backend.

ERROR 2: Poner lógica en el Controller
  → El Controller solo recibe y responde. La lógica va en Service.

ERROR 3: Commitar el .env
  → Nunca. Usa .env.example para el template y .gitignore para el real.

ERROR 4: Hacer animaciones en useEffect
  → GSAP siempre en useLayoutEffect para evitar flash.

ERROR 5: No tener CI antes de deployar manualmente
  → Si deployaste a mano, DevOps no existe todavía.

ERROR 6: Usar any en TypeScript
  → Si no sabes el tipo, pon `unknown` y cástalo. Nunca `any`.

ERROR 7: Escribir código sin diseñar la arquitectura primero
  → Un módulo importante siempre pasa por Architecture antes de implementarse.

ERROR 8: El Domain importa algo de Express o Prisma
  → Si el dominio conoce la infraestructura, Architecture falló. El dominio es puro.
```

---

## 📁 Estructura final — Los 4 agentes

```
clase walter 2/
├── DEVELOPMENT_GUIDES/
│   ├── AGENT_DECISION_TREE.md          ← ¿Cuál agente uso? (30 seg)
│   ├── MASTER_GUIDE.md                 ← Este archivo (cómo usarlos)
│   │
│   ├── frontend/
│   │   └── AGENT_FRONTEND.md           ← 🎨 React, Tailwind, GSAP
│   │
│   ├── backend/
│   │   └── AGENT_BACKEND.md            ← 🗄️ Express, Prisma, Zod
│   │
│   ├── devops/
│   │   └── AGENT_DEVOPS.md             ← 🚀 CI/CD, Docker, Deploy
│   │
│   └── architecture/
│       └── AGENT_ARCHITECTURE.md       ← 🏛️ SOLID, Clean Arch, DDD
│
└── [tu código]
```

---

## ⚡ Arranque en 60 segundos

```
Tengo una tarea nueva
        ↓
Abro AGENT_DECISION_TREE.md (30 seg para identificar el agente)
        ↓
Abro AGENT_[nombre].md
        ↓
Copio el template del agente
        ↓
Lo relleno con mi caso
        ↓
Implemento siguiendo los patrones del agente
        ↓
Verifico el checklist del agente
        ↓
✅ Hecho
```

---

## 🧭 Cuándo usar DOS agentes

| Situación | Orden |
|-----------|-------|
| Módulo nuevo importante | Architecture → Backend |
| Feature completa (UI + API) | Backend → Frontend |
| Código existente difícil de mantener | Architecture → Backend o Frontend |
| Deploy de una feature nueva | Frontend + Backend → DevOps |
| Algo roto en producción | Backend o Frontend → DevOps |
| Refactor + nuevo endpoint | Architecture → Backend |

---

*Guía Maestra v2.0 · 4 Agentes · 2026-05-25*
