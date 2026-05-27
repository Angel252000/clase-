# 🌳 ÁRBOL DE DECISIÓN — 4 AGENTES

Encuentra tu agente en menos de 30 segundos.

---

## RAÍZ — Una pregunta, cuatro caminos

```
                         ┌─────────────────────────────┐
                         │        ¿QUÉ NECESITO?        │
                         └──────────────┬──────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┐
        │               │               │               │
        ▼               ▼               ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌───────────────┐
│ ¿Lo ve el   │ │ ¿Vive en el │ │ ¿Va a produc-│ │ ¿Cómo organi- │
│ usuario?    │ │ servidor/BD?│ │ ción o infra?│ │ zar/diseñar?  │
└──────┬───────┘ └──────┬──────┘ └──────┬───────┘ └───────┬───────┘
       │                │               │                 │
       ▼                ▼               ▼                 ▼
╔═══════════╗    ╔═══════════╗   ╔═════════════╗  ╔══════════════════╗
║ 🎨        ║    ║ 🗄️        ║   ║ 🚀 ⭐       ║  ║ 🏛️ ⭐            ║
║ FRONTEND  ║    ║ BACKEND   ║   ║ DEVOPS      ║  ║ ARCHITECTURE     ║
╚═══════════╝    ╚═══════════╝   ╚═════════════╝  ╚══════════════════╝
```

---

## 🎨 FRONTEND — ¿Es mi caso?

```
¿Tu tarea involucra...?
│
├─── COMPONENTES
│    ├─ Botón, modal, card, tabla, form, navbar        → 🎨 FRONTEND
│    ├─ Página completa o layout                       → 🎨 FRONTEND
│    └─ Modificar/extender componente existente        → 🎨 FRONTEND
│
├─── ANIMACIONES
│    ├─ Scroll reveal, parallax (GSAP + ScrollTrigger)  → 🎨 FRONTEND
│    ├─ Transición de entrada/salida (Framer Motion)    → 🎨 FRONTEND
│    └─ Animación compleja con timeline                 → 🎨 FRONTEND
│
├─── ESTILOS
│    ├─ Tailwind, responsive design, dark mode          → 🎨 FRONTEND
│    └─ Bug visual (se ve mal en móvil, overflow…)      → 🎨 FRONTEND
│
└─── PERFORMANCE / TESTS
     ├─ Lighthouse bajo, bundle grande, lazy load        → 🎨 FRONTEND
     └─ Tests de componente (Vitest) o E2E (Playwright)  → 🎨 FRONTEND

Archivo: DEVELOPMENT_GUIDES/frontend/AGENT_FRONTEND.md
```

---

## 🗄️ BACKEND — ¿Es mi caso?

```
¿Tu tarea involucra...?
│
├─── ENDPOINTS / API
│    ├─ GET, POST, PUT, DELETE de cualquier recurso     → 🗄️ BACKEND
│    ├─ Autenticación (login, registro, JWT)            → 🗄️ BACKEND
│    └─ Middleware (guard, logger, rate limit)          → 🗄️ BACKEND
│
├─── BASE DE DATOS
│    ├─ Nuevo modelo o tabla (Prisma schema)            → 🗄️ BACKEND
│    ├─ Migración, relación entre tablas               → 🗄️ BACKEND
│    ├─ Query lenta que necesita índice o reescritura   → 🗄️ BACKEND
│    └─ Caché con Redis                                → 🗄️ BACKEND
│
├─── VALIDACIÓN / LÓGICA
│    ├─ Schema Zod para validar datos de entrada        → 🗄️ BACKEND
│    └─ Regla de negocio compleja en el server          → 🗄️ BACKEND
│
└─── TESTS
     └─ Tests unitarios de service o integración de API → 🗄️ BACKEND

Archivo: DEVELOPMENT_GUIDES/backend/AGENT_BACKEND.md
```

---

## 🚀 DEVOPS — ⭐ CRÍTICO DE PRODUCCIÓN — ¿Es mi caso?

```
¿Tu tarea involucra...?
│
├─── GIT / VERSIONADO
│    ├─ Estrategia de ramas, Conventional Commits       → 🚀 DEVOPS
│    └─ Conflictos, rebase, historial complicado        → 🚀 DEVOPS
│
├─── CI/CD PIPELINES
│    ├─ GitHub Actions que corra tests en cada PR       → 🚀 DEVOPS
│    └─ Pipeline que deploya solo cuando CI pasa        → 🚀 DEVOPS
│
├─── DOCKER
│    ├─ Dockerfile para producción (multi-stage)        → 🚀 DEVOPS
│    └─ docker-compose.yml para entorno local           → 🚀 DEVOPS
│
├─── DEPLOY
│    ├─ Frontend → Vercel                              → 🚀 DEVOPS
│    ├─ Backend  → Railway / Render                    → 🚀 DEVOPS
│    └─ Variables de entorno y secrets                  → 🚀 DEVOPS
│
└─── MONITOREO
     └─ Sentry, logs, alertas                           → 🚀 DEVOPS

Archivo: DEVELOPMENT_GUIDES/devops/AGENT_DEVOPS.md
```

---

## 🏛️ ARCHITECTURE — ⭐ CRÍTICO DE ESTRUCTURA — ¿Es mi caso?

```
¿Tu tarea involucra...?
│
├─── DISEÑO DE MÓDULO NUEVO
│    ├─ No sé cómo organizar las carpetas               → 🏛️ ARCHITECTURE
│    ├─ Módulo con lógica compleja (pagos, usuarios)    → 🏛️ ARCHITECTURE
│    └─ Necesito definir las interfaces antes de codear → 🏛️ ARCHITECTURE
│
├─── PRINCIPIOS SOLID
│    ├─ Una clase hace demasiadas cosas (viola S)       → 🏛️ ARCHITECTURE
│    ├─ Agregar feature rompe código existente (viola O)→ 🏛️ ARCHITECTURE
│    ├─ Interfaz gigante con métodos que no uso (viola I)→ 🏛️ ARCHITECTURE
│    └─ Dependo directo de Prisma/Express en dominio (D)→ 🏛️ ARCHITECTURE
│
├─── CLEAN ARCHITECTURE / DDD
│    ├─ Quiero separar: presentación / aplicación / dominio / infra → 🏛️ ARCHITECTURE
│    ├─ Modelar con Entities y Value Objects            → 🏛️ ARCHITECTURE
│    └─ Repositorios como interfaces en el dominio      → 🏛️ ARCHITECTURE
│
├─── PATRONES DE DISEÑO
│    ├─ Repository (acceso a datos desacoplado)         → 🏛️ ARCHITECTURE
│    ├─ Factory (crear objetos complejos)               → 🏛️ ARCHITECTURE
│    └─ Strategy (algoritmos intercambiables)           → 🏛️ ARCHITECTURE
│
└─── REFACTORING
     ├─ Archivo de 400+ líneas que nadie entiende       → 🏛️ ARCHITECTURE
     ├─ Cambiar una cosa rompe 5 archivos más           → 🏛️ ARCHITECTURE
     └─ El equipo no sabe dónde poner el código nuevo   → 🏛️ ARCHITECTURE

Archivo: DEVELOPMENT_GUIDES/architecture/AGENT_ARCHITECTURE.md
```

---

## ⚠️ Casos donde usas DOS agentes

| Situación | Orden |
|-----------|-------|
| Módulo nuevo importante | Architecture → Backend |
| Feature completa (UI + API) | Backend → Frontend |
| Código difícil de mantener | Architecture → Backend o Frontend |
| Deploy de una feature nueva | Frontend + Backend → DevOps |
| Algo roto en producción (bug + deploy del fix) | Backend o Frontend → DevOps |
| Refactor de servicio + nuevo endpoint | Architecture → Backend |

---

## 🧭 Resumen en 6 líneas

```
¿Lo ve el usuario?        →  🎨  frontend/AGENT_FRONTEND.md
¿Vive en el servidor?     →  🗄️  backend/AGENT_BACKEND.md
¿Sale a producción?       →  🚀  devops/AGENT_DEVOPS.md       ⭐ CRÍTICO
¿Cómo organizo el código? →  🏛️  architecture/AGENT_ARCHITECTURE.md  ⭐ CRÍTICO

¿Feature completa?        →  Architecture → Backend → Frontend → DevOps
¿Duda entre dos?          →  el que produce datos va primero
```

---

*v4.0 · 4 agentes · 2026-05-25*
