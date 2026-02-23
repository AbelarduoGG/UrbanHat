# 06. Etapas de Implementación Backend (Next.js + Mongo Atlas)

**Fecha:** 18 de febrero de 2026  
**Responsable backend:** Josué  
**Objetivo:** dejar base escalable para web + app Android con API estable (`/api/v1/*`).

---

## Estado actual

- Conexión a Mongo Atlas lista vía `MONGODB_URI` en `.env.local`.
- Modelos Mongoose creados (`User`, `Product`, `Order`).
- Estructura separada por capas:
  - `app/api/v1/**` → rutas/controladores HTTP
  - `lib/services/**` → lógica de negocio
  - `lib/db/**` → conexión/modelos
  - `lib/validations/**` → validaciones Zod
  - `lib/types/**` → contratos compartidos
- Login/registro conectados a DB (bcrypt + API) para frontend web.

---

## Etapa 1 — Fundaciones (Hoy)

### Meta
Tener autenticación funcional y patrón de arquitectura claro para seguir creciendo.

### Checklist
- [x] `POST /api/v1/auth/register` crea usuario en Mongo con contraseña hasheada (bcrypt).
- [x] `POST /api/v1/auth/login` valida credenciales con bcrypt.
- [x] Front web (`/login` y `/registro`) usa API real y deja de depender de `localStorage` para auth.
- [x] Convención de capas aplicada (ruta → servicio → modelo).

### Entregable
- Login funcional extremo a extremo (UI web → API → MongoDB Atlas).

---

## Etapa 2 — Contrato estable para Android (Prioridad alta)

### Meta
Dejar API consistente para consumir desde Kotlin sin romper integración.

### Checklist
- [ ] Confirmar contrato JSON único para todas las rutas (`{ success, data, error }`).
- [x] Documentar ejemplos request/response reales de:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/register`
  - `GET /api/v1/products`
  - `GET/POST /api/v1/orders`
- [x] Definir estrategia de autenticación móvil inicial:
  - JWT bearer como principal
  - `x-user-id` como compatibilidad MVP
- [x] Agregar endpoint `GET /api/v1/auth/me`.

### Entregable
- Documento de integración Android actualizado + endpoints probados.

---

## Etapa 3 — Reglas de negocio críticas

### Meta
Garantizar consistencia de inventario y pedidos.

### Checklist
- [ ] Migrar creación de orden a transacción Mongoose (`session`) para atomicidad real.
- [ ] Validar stock por item y fallar toda la orden si un producto no cumple.
- [ ] Registrar snapshot de precio y nombre al comprar (ya iniciado, validar cobertura).
- [ ] Controlar errores de cast (`ObjectId`) con mensajes HTTP claros.

### Entregable
- Flujo de compra robusto y sin desincronización de stock.

---

## Etapa 4 — Seguridad y roles

### Meta
Blindar rutas y separar claramente permisos.

### Checklist
- [x] Middleware base para rutas sensibles (`/cuenta`, `/api/v1/orders`) y control de rol en `/admin` cuando hay sesión backend.
- [x] Reglas por rol en servicios (no solo en frontend).
- [ ] Sanitizar respuestas para nunca exponer `password`.
- [ ] Rate limit básico en auth para evitar abuso.

### Entregable
- Control de acceso por rol en backend.

---

## Etapa 5 — Calidad y despliegue

### Meta
Preparar mantenimiento largo plazo.

### Checklist
- [ ] Pruebas mínimas de API (auth + orders).
- [ ] Logging estructurado para errores de producción.
- [ ] Seeds de desarrollo (`superadmin`, productos demo).
- [ ] Checklist de deploy en Vercel + variables de entorno.

### Entregable
- Backend estable para continuar features sin deuda crítica.

---

## Notas de arquitectura (equivalente mental a Laravel)

- En Laravel sueles separar `routes` + `controllers` + `services` + `models`.
- En Next.js App Router, el equivalente recomendado para escalar es:
  - `app/api/v1/.../route.ts` = controlador HTTP
  - `lib/services/*.ts` = lógica de dominio
  - `lib/db/models/*.ts` = modelo persistencia
  - `lib/validations/*.ts` = request validation
- Evitar meter lógica de negocio directa dentro de `route.ts`.

---

## Política de reinicio de base de datos

Sí, puedes borrar la base cuando quieras y Mongoose no se rompe por eso.

- Si eliminas colecciones/documentos, Mongoose las recrea automáticamente cuando vuelvas a guardar datos.
- Si cambias nombre de DB o clúster, solo actualiza `MONGODB_URI`.
- Recomendado para desarrollo:
  - usar una DB de `dev` separada de `prod`
  - tener script de seed para repoblar datos rápidamente
  - nunca reiniciar la base de producción sin backup

---

## Variables de entorno requeridas

```env
MONGODB_URI=
JWT_SECRET=
ADMIN_SEED_KEY=
SUPERADMIN_EMAIL=
SUPERADMIN_PASSWORD=
SUPERADMIN_NAME=Super Admin
```

- `ADMIN_SEED_KEY`: API key para ejecutar `POST /api/v1/admin/seed-superadmin`.
- `JWT_SECRET`: clave para firmar/verificar tokens JWT en móvil/API.

---

## Decisiones recomendadas para el proyecto escolar

### 1) Registro de vendedores
- **Recomendado (más control y menos riesgo):** alta de vendedores solo por `superadmin`/equipo.
- Mantener registro público solo para compradores (`buyer`).
- En una etapa posterior, se puede agregar solicitud de alta para seller con aprobación manual.

### 2) Superadmin fijo
- Evitar hardcodear `superadmin123` en código fuente.
- Recomendado:
  - crear un único superadmin inicial por seed
  - password inicial por variable de entorno
  - forzar cambio de contraseña desde panel al primer acceso

### 3) Cloudinary para imágenes
- Sí, **Cloudinary Free** es buena opción para proyecto escolar.
- Ventajas: CDN, transformaciones, URLs estables, menor carga en backend.
- En UrbanHat, guardar solo la URL final en `Product.imageUrl`.

### 4) Pagos sandbox
- Se acepta uso de **Stripe en modo test/sandbox** para simular compras.
- No guardar datos sensibles de tarjeta; usar checkout/session de Stripe.
