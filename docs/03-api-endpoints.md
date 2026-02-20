# 03. API Endpoints (Contrato para App Android + Web Admin)

**Base URL local:** `http://localhost:3000/api/v1`  
**Base URL producción:** `https://tu-dominio.vercel.app/api/v1`

Formato estándar de respuesta:

```json
{ "success": true, "data": {}, "error": "" }
```

---

## 1) Autenticación

### POST `/auth/register`
Registro público solo para compradores (`buyer`).

**Body**
```json
{
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "secreto123"
}
```

**Response 201**
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

### POST `/auth/login`
Login para web (cookie HTTPOnly) y móvil (JWT).

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

## 2) Productos (catálogo móvil)

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

### POST `/products`
Crea producto para el vendedor autenticado.

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

## 3) Órdenes (compras móvil)

### POST `/orders`
### GET `/orders`

Autenticación aceptada (prioridad):
1. Cookie de sesión web
2. `Authorization: Bearer <jwt>`
3. `x-user-id` (MVP escolar / compatibilidad)

---

## 4) Endpoints administrativos

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

## 5) Flujo recomendado

### Móvil comprador
- Login -> guardar `token`
- Consumir `/products`
- Crear y listar `/orders` con `Authorization: Bearer <token>`

### Web admin/seller
- Login web -> cookie HTTPOnly
- Dashboard en `/admin`
- Gestión de vendedores desde endpoints admin (superadmin)
