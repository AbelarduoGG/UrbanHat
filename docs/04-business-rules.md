# 04. Reglas de Negocio y Lógica Crítica

## 1) Gestión de inventario

- Antes de crear una orden se valida `stock` de cada producto.
- Si un producto no tiene stock suficiente, se rechaza la compra.
- Al confirmar compra se descuenta inventario y se registra la orden.
- En móvil, productos sin stock se deben ocultar o deshabilitar para compra.

## 2) Marketplace multi-vendedor

- Cada producto pertenece a un `sellerId`.
- Un vendedor solo puede gestionar sus productos.
- Un vendedor nunca puede editar o eliminar productos de otro vendedor.
- Ganancia neta (simulada) para dashboard seller: `venta - 10% comisión`.

## 3) Seguridad (enfoque escolar/MVP)

- **Web:** sesión por cookie HTTPOnly en login/register.
- **Móvil:** autenticación temporal por header `x-user-id`.
- **Middleware:**
  - protege `/cuenta` (requiere sesión)
  - valida autenticación para `/api/v1/orders` (cookie o `x-user-id`)
  - aplica control de rol en `/admin` cuando existe sesión backend.
- Roles permitidos: `superadmin`, `seller`, `buyer`.

## 4) Separación de responsabilidades

- **Móvil comprador:** catálogo, carrito, checkout, historial de órdenes.
- **Web admin/seller:** gestión de productos, ventas e inventario.
- Backend debe mantener la lógica en servicios (`lib/services/*`), no en vistas React.

## 5) Restricciones del proyecto

- No integrar pasarela de pagos real en esta etapa.
- Imágenes de productos se manejan como URL.
- Evitar features fuera de alcance académico/MVP.
