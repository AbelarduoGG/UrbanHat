# UrbanHat

Marketplace escolar con arquitectura de monolito modular en Next.js para:

- Web (admin y vendedores)
- API REST bajo `/api/v1`
- Cliente instalable PWA

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS
- MongoDB (Mongoose)
- Jest + ESLint

## Requisitos

- Node.js 20+
- pnpm 9+

## Gestor de paquetes oficial

Este repositorio usa **pnpm** como gestor unico.

- Usa `pnpm-lock.yaml` como lockfile oficial.
- No usar `npm install` ni `yarn` para evitar lockfiles inconsistentes.

## Instalacion

```bash
pnpm install
```

## Comandos principales

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm test:watch
```

## Variables de entorno

1. Copia el archivo base:

```bash
cp .env.example .env.local
```

2. Completa credenciales locales (MongoDB, JWT, Stripe, etc).

## PWA

- Manifest principal: `app/manifest.ts` (ruta final: `/manifest.webmanifest`)
- Service Worker: `public/sw.js`
- Registro del SW: `components/pwa-register.tsx` (montado en `app/layout.tsx`)

## Documentacion del proyecto

- Arquitectura: `docs/01-architecture.md`
- Esquema de base de datos: `docs/02-database-schema.md`
- Contrato API: `docs/03-api-endpoints.md`
- Reglas de negocio: `docs/04-business-rules.md`

## Notas de colaboracion

- Mantener cambios pequenos y atomicos.
- Para backend, seguir validaciones en `lib/validations`, servicios en `lib/services` y rutas en `app/api/v1`.
- Formato de respuesta API esperado:

```json
{ "success": true, "data": {}, "error": "" }
```
