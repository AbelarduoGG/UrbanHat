# 05. Reorganización del Proyecto — Changelog

**Fecha:** 15 de febrero de 2026  
**Autor:** Josué (Backend / API)

---

## ¿Qué se encontró al clonar?

Tu compañero subió todo de golpe a `main` sin estructura clara. Esto es lo que había:

### Carpeta `urbanhat/` (ELIMINADA)
Era un proyecto **`npx create-next-app urbanhat`** sin modificar. Contenía:
- La página default de Next.js ("To get started, edit the page.tsx file")
- Un `package.json` independiente con dependencias básicas
- `public/` con los SVGs default de Vercel (vercel.svg, next.svg, etc.)
- **No tenía NADA de código del proyecto**. Se eliminó.

### Archivo `next.config.ts` (ELIMINADO)
Había **dos** configuraciones de Next.js en la raíz:
- `next.config.mjs` → La real, con `ignoreBuildErrors` e `images.unoptimized`
- `next.config.ts` → Vacía/default. Se eliminó para evitar conflicto.

### Archivo `lib/data.ts` (ELIMINADO)
Había **dos** archivos de datos de productos:
- `lib/products.ts` → El real, con 6 productos, interfaz `Product`, categorías
- `lib/data.ts` → Viejo/incompleto, con solo 2 productos sin tipado completo. Se eliminó.

### Carpeta `app/` — Lo que hizo tu compañero (FRONTEND)
| Ruta | Qué es |
|------|--------|
| `app/page.tsx` | Home page con Hero, Productos, Features, About, Newsletter, Contact, Footer |
| `app/layout.tsx` | Layout raíz con fuentes Inter + Oswald, título "Urban Hat" |
| `app/admin/page.tsx` | Dashboard admin con CRUD de productos (699 líneas, login hardcodeado: admin/urban2026) |
| `app/checkout/` | Página de checkout con layout propio |
| `app/cuenta/` | Página de perfil/cuenta del usuario |
| `app/login/` | Página de login |
| `app/registro/` | Página de registro |

### Carpeta `components/` — Componentes UI (FRONTEND)
Tu compañero instaló **shadcn/ui** (librería de componentes). 
- `components/ui/` → 40+ componentes base de shadcn (button, dialog, card, input, etc.)
- Componentes de negocio: `navbar.tsx`, `hero.tsx`, `cart-drawer.tsx`, `product-modal.tsx`, `ProductCard.tsx`, `footer.tsx`, etc.

### Carpeta `lib/` — Lógica compartida
| Archivo | Qué hace |
|---------|----------|
| `lib/auth-context.tsx` | Autenticación con localStorage (registro/login de clientes) |
| `lib/cart-context.tsx` | Carrito de compras (estado en memoria, no persiste en DB) |
| `lib/products-context.tsx` | Estado de productos (lee/escribe en localStorage) |
| `lib/products.ts` | Datos hardcodeados de 6 gorras + interfaz Product |
| `lib/utils.ts` | Utilidad `cn()` para clases CSS (tailwind-merge) |

### Carpeta `hooks/`
| Archivo | Qué hace |
|---------|----------|
| `hooks/use-mobile.tsx` | Hook para detectar si es mobile |
| `hooks/use-toast.ts` | Hook para notificaciones toast |

---

## ¿Qué se reorganizó?

### Estructura final del proyecto

```
UrbanHat/
├── docs/                          # Documentación (este archivo)
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Home (frontend)
│   ├── layout.tsx                 # Layout raíz
│   ├── globals.css                # Estilos globales
│   ├── admin/                     # Dashboard admin (frontend)
│   ├── checkout/                  # Checkout (frontend)
│   ├── cuenta/                    # Perfil usuario (frontend)
│   ├── login/                     # Login (frontend)
│   ├── registro/                  # Registro (frontend)
│   └── api/v1/                    # ← NUEVO: API para cliente instalable (PWA)
│       ├── auth/login/route.ts    # POST /api/v1/auth/login
│       ├── auth/register/route.ts # POST /api/v1/auth/register
│       ├── products/route.ts      # GET /api/v1/products
│       └── orders/route.ts        # GET/POST /api/v1/orders
├── components/                    # Componentes React (frontend)
│   ├── ui/                        # shadcn/ui
│   └── *.tsx                      # Componentes de negocio
├── hooks/                         # React hooks (frontend)
├── lib/                           # Lógica del proyecto
│   ├── auth-context.tsx           # Context auth frontend (existente)
│   ├── cart-context.tsx           # Context carrito frontend (existente)
│   ├── products-context.tsx       # Context productos frontend (existente)
│   ├── products.ts                # Datos hardcodeados frontend (existente)
│   ├── utils.ts                   # Utilidades CSS (existente)
│   ├── db/                        # ← NUEVO: Base de datos (backend)
│   │   ├── connection.ts          # Conexión MongoDB Atlas
│   │   └── models/                # Modelos Mongoose
│   │       ├── user.model.ts
│   │       ├── product.model.ts
│   │       ├── order.model.ts
│   │       └── index.ts
│   ├── services/                  # ← NUEVO: Lógica de negocio (backend)
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── order.service.ts
│   ├── validations/               # ← NUEVO: Esquemas Zod (compartido)
│   │   ├── auth.schema.ts
│   │   ├── product.schema.ts
│   │   └── order.schema.ts
│   └── types/                     # ← NUEVO: Tipos TypeScript (compartido)
│       └── index.ts
├── public/                        # Archivos estáticos
├── styles/                        # CSS adicional
├── .env.local                     # Variables de entorno (NO se sube a git)
├── package.json                   # Dependencias
└── ...configs
```

---

## Quién trabaja en qué

| Carpeta/Archivo | Responsable | Descripción |
|-----------------|-------------|-------------|
| `app/api/v1/**` | **Josué (Backend)** | Endpoints REST para PWA/cliente instalable |
| `lib/db/**` | **Josué (Backend)** | Conexión y modelos MongoDB |
| `lib/services/**` | **Josué (Backend)** | Lógica de negocio |
| `lib/validations/**` | **Josué (Backend)** | Validación de datos con Zod |
| `lib/types/**` | **Compartido** | Tipos TypeScript |
| `app/` (páginas) | **Compañero (Frontend)** | Páginas web |
| `components/**` | **Compañero (Frontend)** | Componentes React |
| `hooks/**` | **Compañero (Frontend)** | Hooks React |
| `lib/*-context.tsx` | **Compañero (Frontend)** | Estado del frontend |

---

## Dependencias agregadas

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `mongoose` | ^8.9.0 | ODM para MongoDB |
| `bcryptjs` | ^2.4.3 | Hash de contraseñas |
| `@types/bcryptjs` | ^2.4.6 | Tipos TS para bcryptjs |

### Dependencias corregidas (conflictos)
| Paquete | Antes | Después | Razón |
|---------|-------|---------|-------|
| `date-fns` | 4.1.0 | 3.6.0 | Incompatible con react-day-picker 8.x |
| `react-day-picker` | 8.10.1 | 9.13.2 | 8.x no soporta React 19 |

---

## Archivos eliminados

| Archivo/Carpeta | Razón |
|-----------------|-------|
| `urbanhat/` | Proyecto `create-next-app` vacío sin código útil |
| `next.config.ts` | Duplicado de `next.config.mjs` |
| `lib/data.ts` | Datos de productos duplicados/viejos (se queda `lib/products.ts`) |

---

## Reglas para trabajar juntos

1. **NO subir directo a `main`**. Crear rama → hacer PR → mergear.
2. **Documentar cambios**: Si haces algo importante, agrega una entrada aquí o crea un nuevo `.md` en `docs/`.
3. **Frontend** toca: `app/` (páginas), `components/`, `hooks/`, `lib/*-context.tsx`
4. **Backend** toca: `app/api/`, `lib/db/`, `lib/services/`, `lib/validations/`, `lib/types/`
5. **Nunca** editar `.env.local` del otro sin avisar.
6. **Hacer `npm install`** después de cada `git pull` si hay cambios en `package.json`.
