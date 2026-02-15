### Archivo 4: `docs/04-business-rules.md`
La lógica de negocio para que Copilot sepa cómo programar las funciones.

```markdown
# 04. Reglas de Negocio y Lógica Crítica

## 1. Gestión de Inventarios (Integridad)
- **Validación de Stock:** Antes de crear una orden, el sistema debe consultar el campo `stock` de la colección `Products`.
- **Atomicidad:** Al confirmar una compra, la operación de restar inventario y crear la orden debe ser secuencial y validada.
- **Visualización:** En la App Móvil, si `stock == 0`, el botón de "Agregar al carrito" debe estar deshabilitado o el producto oculto.

## 2. Lógica Multi-vendedor (Marketplace)
- **Visibilidad Dashboard Vendedor:**
    - Al hacer login en la web, si `role === 'seller'`, se debe ejecutar una query: `Product.find({ sellerId: session.user.id })`.
    - Un vendedor **NUNCA** puede editar o borrar productos de otro vendedor.
- **Cálculo de Comisiones (Simulado):**
    - En el Dashboard de ventas, la "Ganancia Neta" se calcula visualmente:
    - `Total Venta - 10% (Comisión Urban Hat) = Ganancia Vendedor`.

## 3. Seguridad Simplificada (Escolar)
- **Web:** Utilizar `NextAuth.js` con estrategia `Credentials` para manejo de sesiones seguras y protección de rutas `/admin`.
- **Móvil:** Autenticación basada en ID simple (sin JWT complejo) para facilitar el desarrollo en Android/Kotlin.
- **Roles:** Middleware en Next.js debe proteger `/admin` para que solo entren roles `admin` o `seller`.

## 4. Restricciones
- No implementar pasarela de pagos real (Stripe/PayPal). El flujo termina al crear la orden en base de datos.
- Las imágenes se manejan estrictamente como URLs (String). No implementar subida de archivos (AWS S3) para ahorrar tiempo.