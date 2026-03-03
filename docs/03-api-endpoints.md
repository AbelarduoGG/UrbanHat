# 03. API Endpoints (Contrato para PWA + Web Admin)

**Base URL local:** `http://localhost:3000/api/v1`  
**Base URL producción:** `https://tu-dominio.vercel.app/api/v1`

Formato estándar de respuesta:

```json
{ "success": true, "data": {}, "error": "" }
```

---

## 1) Autenticación

### POST `/auth/register`
Registro público unificado para compradores (`buyer`) y vendedores (`seller`).

**Body**
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan@email.com",
  "password": "secreto123",
  "role": "buyer"
}
```

**Body (vendedor)**
```json
{
  "nombre": "Maria",
  "apellido": "Lopez",
  "email": "maria@tienda.com",
  "password": "secreto123",
  "role": "seller",
  "shopName": "Centro Caps",
  "telefono": "5551234567",
  "direccion": "Av. Principal 123",
  "ciudad": "Monterrey",
  "estado": "NL",
  "codigoPostal": "64000"
}
```

**Response 201 (buyer)**
```json
{
  "success": true,
  "data": {
    "id": "65f...",
    "name": "Juan Perez",
    "email": "juan@email.com",
    "role": "buyer",
    "isActive": true,
    "createdAt": "2026-02-18T...",
    "token": "jwt..."
  }
}
```

**Response 201 (seller pendiente)**
```json
{
  "success": true,
  "data": {
    "pendingApproval": true,
    "message": "Registro de vendedor creado. Un administrador debe activar tu cuenta para poder iniciar sesión."
  }
}
```

### POST `/auth/login`
Login para web (cookie HTTPOnly) y cliente instalable/PWA (JWT en modo API).

**Body**
```json
{
  "email": "juan@email.com",
  "password": "secreto123"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "65f...",
    "name": "Juan Perez",
    "email": "juan@email.com",
    "role": "buyer",
    "isActive": true,
    "createdAt": "2026-02-18T...",
    "token": "jwt..."
  }
}
```

### GET `/auth/me`
Devuelve el usuario autenticado (cookie o bearer token).

### POST `/auth/logout`
Limpia cookie web.

---

## 2) Productos (catálogo PWA)

### GET `/products`
Lista productos activos.

**Response 200 (resumen)**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f...",
      "sellerId": "65a...",
      "sellerName": "Caps Centro",
      "name": "Gorra Negra Premium",
      "brand": "Urban Hat",
      "description": "Visera plana",
      "price": 499,
      "stock": 10,
      "imageUrl": "https://res.cloudinary.com/.../img1.jpg",
      "imageUrls": [
        "https://res.cloudinary.com/.../img1.jpg",
        "https://res.cloudinary.com/.../img2.jpg"
      ],
      "category": "Snapback",
      "isActive": true
    }
  ]
}
```

### GET `/products?mine=true`
Lista productos del vendedor autenticado.

### GET `/products?all=true`
Lista todos los productos (activos, pausados y archivados) para `superadmin`.

### POST `/products`
Crea producto para el vendedor autenticado.

`category` debe ser uno de:
- `Snapback`
- `Fitted`
- `Trucker`
- `Dad Hat`
- `Flat Brim`
- `5 Panels`
- `Bucket Hat`
- `Military`

**Body**
```json
{
  "name": "Gorra Negra Premium",
  "brand": "Urban Hat",
  "description": "Visera plana",
  "price": 499,
  "stock": 10,
  "imageUrls": [
    "https://res.cloudinary.com/.../img1.jpg",
    "https://res.cloudinary.com/.../img2.jpg"
  ],
  "category": "Snapback"
}
```

### PATCH `/products/:id`
Actualiza producto del vendedor dueño.

### DELETE `/products/:id`
Desactiva (soft delete) un producto del vendedor dueño.

### POST `/uploads/image`
Sube imagen a Cloudinary desde archivo (`multipart/form-data`, campo `file`).

**Response 200**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../imagen.jpg"
  }
}
```

---

## 3) Órdenes (compras PWA)

### POST `/orders`
### GET `/orders`

### GET `/orders?scope=seller`
Lista órdenes que incluyen productos del vendedor autenticado (con detalle de comprador y estado de envío).

### GET `/orders?scope=admin`
Lista todas las órdenes (solo `superadmin`).

Autenticación aceptada (prioridad):
1. Cookie de sesión web
2. `Authorization: Bearer <jwt>`
3. `x-user-id` (MVP escolar / compatibilidad)

---

## 4) Pagos (Stripe sandbox)

### POST `/payments/create-checkout-session`
Crea sesión de Stripe Checkout con los productos del carrito.

**Body**
```json
{
  "origin": "http://localhost:3000",
  "items": [
    { "productId": "65f...", "quantity": 2 }
  ]
}
```

### POST `/payments/confirm`
Confirma pago con `sessionId` de Stripe y crea la orden final en BD.

**Body**
```json
{
  "sessionId": "cs_test_...",
  "items": [
    { "productId": "65f...", "quantity": 2 }
  ],
  "shipping": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "telefono": "5551234567",
    "calle": "Av. Principal",
    "numero": "123",
    "colonia": "Centro",
    "ciudad": "Monterrey",
    "estado": "NL",
    "codigoPostal": "64000"
  }
}
```

Variables requeridas en producción/sandbox:
- `STRIPE_KEY` (compatibilidad también con `STRIPE_SECRET_KEY`)

---

## 5) Endpoints administrativos

### POST `/admin/seed-superadmin`
Crea superadmin único (si no existe).

- Header requerido: `x-seed-key`
- Debe coincidir con `ADMIN_SEED_KEY` en `.env.local`
- Usa `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME`

### POST `/admin/sellers`
Registra vendedor. Solo `superadmin`.

**Body**
```json
{
  "name": "Tienda Centro",
  "email": "seller@urbanhat.com",
  "password": "pass1234",
  "shopName": "Centro Caps"
}
```

### POST `/admin/change-password`
Cambia contraseña del usuario autenticado (incluido superadmin).

**Body**
```json
{
  "currentPassword": "actual123",
  "newPassword": "nueva123"
}
```

---

## 6) Flujo recomendado

### Cliente comprador (PWA)
- Login -> guardar `token`
- Consumir `/products`
- Crear y listar `/orders` con `Authorization: Bearer <token>`

### Web admin/seller
- Login web -> cookie HTTPOnly
- Dashboard en `/admin`
- Gestión de vendedores desde endpoints admin (superadmin)
