# 03. API Endpoints (Contrato para App Android)

**Base URL local:** `http://localhost:3000/api/v1`  
**Base URL producción:** `https://tu-dominio.vercel.app/api/v1`

Todas las respuestas siguen el formato:

```json
{ "success": true, "data": {}, "error": "" }
```

---

## 1) Autenticación

### POST `/auth/register`
Crea un comprador para usar la app móvil/web.

**Body**
```json
{
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "secreto123",
  "role": "buyer"
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
    "createdAt": "2026-02-18T..."
  }
}
```

### POST `/auth/login`
Inicia sesión para web (cookie HTTPOnly) y también devuelve datos para móvil.

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
    "createdAt": "2026-02-18T..."
  }
}
```

### POST `/auth/logout`
Solo para web. Limpia cookie de sesión.

**Response 200**
```json
{
  "success": true
}
```

---

## 2) Productos (Catálogo móvil)

### GET `/products`
Obtiene productos activos para mostrar en catálogo.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f...",
      "sellerId": "65e...",
      "name": "Snapback Negra",
      "description": "...",
      "price": 549,
      "stock": 10,
      "imageUrl": "https://...",
      "category": "Snapback",
      "isActive": true
    }
  ]
}
```

---

## 3) Órdenes (Compras móvil)

### POST `/orders`
Crea una orden y descuenta stock.

**Autenticación MVP Android:** Header `x-user-id`  
**Autenticación web:** cookie de sesión

**Body**
```json
{
  "items": [
    { "productId": "65f...", "quantity": 2 }
  ]
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "orderId": "660..."
  }
}
```

### GET `/orders`
Lista órdenes del comprador autenticado.

**Autenticación MVP Android:** Header `x-user-id`  
**Autenticación web:** cookie de sesión

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "660...",
      "buyerId": "65f...",
      "items": [],
      "totalAmount": 1098,
      "status": "paid",
      "createdAt": "2026-02-18T..."
    }
  ]
}
```

---

## 4) Notas de integración

1. La app móvil de comprador consume `products` + `orders` + `auth`.
2. La web administrativa se mantiene separada para gestión (admin/seller).
3. El middleware actual protege `/cuenta` por cookie y valida autenticación en `/orders`.
4. Para versión escolar, `x-user-id` es suficiente en Android; en una iteración futura se migra a JWT.
