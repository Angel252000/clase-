# 🎨 FRONTEND AGENT
> React 19 · TypeScript · Tailwind · Vite · GSAP

---

## ¿Cuándo me llamas?
Cuando la tarea afecta **lo que el usuario ve o toca**:
- Crear o modificar un **componente** (botón, modal, card, tabla, form)
- Hacer una **animación** (scroll, hover, transición, 3D)
- **Estilos** (Tailwind, responsive, dark mode)
- **Performance visual** (Lighthouse, bundle, lazy load)
- **Tests de UI** (Vitest, Playwright)

---

## Cómo pedirme algo — Template

```
📌 AGENTE   : Frontend
🎯 NECESITO : [qué componente / animación / fix]
📂 STACK    : React 19 + TypeScript + Tailwind
📋 DETALLES : [props esperadas, comportamiento, estados]
✅ ENTREGAR : [archivos que esperas: .tsx, .test, tipos]
```

**Ejemplo real:**
```
📌 AGENTE   : Frontend
🎯 NECESITO : Componente <DataTable> con paginación y filtro por columna
📂 STACK    : React 19 + TypeScript + Tailwind
📋 DETALLES : Props: data[], columns[], onPageChange().
              Filas por página: 10/25/50. Filtro en header.
✅ ENTREGAR : DataTable.tsx + DataTable.test.tsx + tipos
```

---

## Estructura de carpetas que uso

```
client/src/
├── components/
│   ├── ui/           ← Átomos: Button, Input, Badge, Spinner
│   ├── features/     ← Organismos: ProductCard, UserForm, NavBar
│   └── layouts/      ← Plantillas: DashboardLayout, AuthLayout
├── pages/            ← Páginas completas
├── hooks/            ← Custom hooks (useLocalStorage, useFetch…)
├── utils/            ← Helpers puros (formatDate, cn…)
└── types/            ← Tipos globales TypeScript
```

---

## Mis patrones base

### Componente con variantes
```tsx
// ✅ Así hago un componente tipado y con variantes
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  onClick
}: ButtonProps) {
  const base = 'rounded font-medium transition-all'
  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    ghost:     'bg-transparent text-gray-600 hover:bg-gray-100',
  }
  const sizes = { sm: 'px-3 py-1 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

### Custom Hook
```tsx
// ✅ Lógica separada del visual
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

### Animación con GSAP
```tsx
// ✅ Animación en useLayoutEffect para evitar flash
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' })
      gsap.from('.hero-sub',   { y: 40, opacity: 0, duration: 0.6, delay: 0.2 })
    }, ref)
    return () => ctx.revert()   // ← limpia al desmontar
  }, [])

  return (
    <div ref={ref}>
      <h1 className="hero-title">Título</h1>
      <p  className="hero-sub">Subtítulo</p>
    </div>
  )
}
```

---

## Checklist — antes de dar por terminado

```
[ ] Componente tipado con TypeScript (sin `any`)
[ ] Funciona en móvil (sm:) y desktop (lg:)
[ ] Estados cubiertos: normal, loading, error, vacío
[ ] Test unitario escrito
[ ] Sin console.log en el código
[ ] Accesible: tiene aria-label o role si lo necesita
```

---

## Métricas que debo cumplir

| Qué | Meta |
|-----|------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5 s |
| Time to Interactive | < 2 s |
| Test coverage | > 70 % |
| Errores en consola | 0 |

---

## Tips para dominarme

1. **Piensa en átomos primero** → Button, Input, Badge. Luego ensámbalos.
2. **Separa lógica de visual** → el hook maneja estado, el componente solo renderiza.
3. **Mobile-first siempre** → escribe las clases `sm:` antes que `lg:`.
4. **GSAP dentro de `useLayoutEffect`**, nunca en `useEffect` para animaciones DOM.
5. **Nombra las props igual que el HTML nativo** cuando puedas (`onClick`, `disabled`, `value`).

---

*Última revisión: 2026-05-22*
