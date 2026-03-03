# 08. Operación de Marketplace, Confianza y Escalabilidad (UrbanHat)

## 1) Objetivo de este documento

Definir qué **sí** implementa UrbanHat en MVP (escolar), qué se deja para fases posteriores y cuáles son las reglas para operar con confianza en México usando Stripe en sandbox.

---

## 2) Alcance claro: qué sí y qué no

## 2.1 Sí va en MVP (obligatorio)

1. Catálogo exclusivo de gorras (categorías fijas).
2. Flujo de pedido trazable: `paid` → `seller_received` → `preparing` → `shipped` → `delivered`.
3. Panel vendedor con ventas detalladas y estado de envío.
4. Panel admin con control de productos, usuarios y filtros globales.
5. Pago por Stripe Checkout (modo sandbox) sin almacenar tarjetas en UrbanHat.
6. Comisión de plataforma del **14%** por venta.

## 2.2 No va en MVP (fase posterior)

1. Motor avanzado de recomendaciones tipo Amazon.
2. Liberación automática bancaria real a vendedores (payout productivo full).
3. Devoluciones automatizadas con logística inversa total.
4. Integración simultánea con múltiples paqueterías productivas.

---

## 3) Regla de catálogo: solo gorras

## 3.1 Control preventivo (backend)

1. Categoría obligatoria y cerrada (`PRODUCT_CATEGORIES`).
2. Campos mínimos obligatorios: nombre, marca, descripción, imágenes, stock, precio.
3. Límite de imágenes y validaciones de formato.

## 3.2 Control operativo (admin)

1. Moderación de los primeros productos por vendedor nuevo (aprobación manual ligera).
2. Política de sanción: ocultar producto + advertencia + bloqueo por reincidencia.
3. Registro de auditoría (quién publicó, cuándo, cambios de estado).

## 3.3 Recomendación fase 2

1. Clasificador de imagen (ML) para detectar artículos no permitidos.
2. Validación semántica de texto (palabras prohibidas / fuera de categoría).

---

## 4) Orden recomendado de productos en home

Para marketplace, usar enfoque híbrido:

1. **Destacados por desempeño** (ventas recientes + disponibilidad de stock).
2. **Más recientes** (descubrimiento de nuevos vendedores).
3. **Filtros por categoría fija** (ya implementado).
4. **Orden manual por precio/nombre** como alternativa de exploración.

Regla MVP defendible:

- Si no hay historial suficiente, priorizar recientes + stock + categoría.

---

## 5) Comisión y modelo económico

## 5.1 Comisión oficial UrbanHat

- Comisión plataforma: **14%** por orden pagada.
- La plataforma absorbe el costo aproximado de pasarela (referencia ~4%) dentro de ese 14%.

## 5.2 Ejemplo de cálculo

Orden de $1,000 MXN (sin considerar envío):

- Comisión plataforma (14%): $140
- Pago bruto vendedor (86%): $860
- Costo pasarela aproximado absorbido por plataforma (4%): ~$40
- Margen plataforma estimado después de pasarela: ~$100

> Nota: El costo real de pasarela depende del contrato final de Stripe y puede incluir cargos fijos por transacción.

---

## 6) Retención de pago por 7 días (protección comprador)

## 6.1 Política

El pago del comprador se considera confirmado al instante, pero el saldo del vendedor se marca como **retenido 7 días** para proteger contra fraude/entrega no cumplida.

## 6.2 Estado operacional sugerido

1. `paid_hold` (pagado retenido)
2. `released_to_seller` (liberado vendedor)
3. `refunded` (si aplica disputa/devolución aprobada)

## 6.3 Implementación recomendada (MVP escalable)

1. Agregar campos en orden/liquidación:
   - `holdUntil` (fecha)
   - `payoutStatus` (`on_hold`, `eligible`, `released`, `blocked`)
2. Al confirmar pago: `holdUntil = createdAt + 7 días`.
3. Job programado diario revisa órdenes elegibles y las marca `eligible`.
4. Liberación a vendedor inicialmente manual/semiautomática en panel admin.

Complejidad: **media** (no alta) si primero se maneja como estado interno y no como payout bancario automático.

---

## 7) Confianza para clientes y vendedores

## 7.1 Cliente

1. Pago en pasarela externa (Stripe), no se almacenan tarjetas en UrbanHat.
2. Estados visibles del pedido y del envío.
3. Políticas claras de devolución y tiempos de respuesta.
4. Evidencia de envío (guía y/o rastreo).

## 7.2 Vendedor

1. Reglas transparentes de comisión (14%).
2. Regla explícita de retención (7 días) y condiciones de liberación.
3. Historial de ventas y estatus de cada orden.
4. Proceso claro de disputas y devoluciones.

---

## 8) Verificación inicial de usuarios para confianza

Sí es viable en MVP con baja complejidad si se hace por etapas:

## 8.1 Verificación recomendada para primeros registros

1. Validación de email obligatoria (todos).
2. Validación de teléfono para vendedores (OTP o confirmación manual).
3. Revisión manual de identidad comercial para primeros vendedores (cohorte inicial).
4. Etiqueta en panel: `sellerVerificationStatus` = `pending|verified|rejected`.

## 8.2 Política sugerida

- Primeros vendedores: onboarding supervisado (mayor control).
- Compradores: verificación ligera; reforzar solo para tickets altos o comportamiento riesgoso.

---

## 9) Envíos en México y sandbox

## 9.1 Flujo base UrbanHat

`paid` → `seller_received` → `preparing` → `shipped` → `delivered`

Con esto ya puedes simular operación tipo marketplace sin bloquearte por integración logística completa.

## 9.2 Opciones para simulación/sandbox

1. **EasyPost** (test mode).
2. **Shippo** (test mode).
3. Proveedores locales en México pueden ofrecer entorno de pruebas o cuentas de desarrollo, sujeto a plan/alta comercial.

Recomendación práctica:

- Para proyecto escolar, iniciar con simulación interna (número de guía mock + cambios de estado).
- En fase 2, integrar un solo proveedor externo y validar disponibilidad vigente para México al momento de implementación.

---

## 10) Política de envío gratis > $1,000

Decisión de negocio recomendada para MVP:

1. Mostrar “envío gratis” al comprador al superar $1,000.
2. Internamente, costo de envío compartido plataforma/vendedor con regla fija.
3. Si el margen de la orden no soporta subsidio, limitar elegibilidad por producto o zona.

Regla inicial simple defendible:

- Plataforma absorbe primero hasta un tope (ej. $99), y el excedente se comparte con vendedor.

---

## 11) Cómo defender el proyecto en exposición

Mensaje central:

> UrbanHat prioriza confianza y control operativo antes de escalar complejidad.

Puntos de defensa:

1. Catálogo controlado (solo gorras) con validación y moderación.
2. Flujo de pagos seguro con Stripe (sandbox en etapa académica).
3. Protección al comprador mediante retención de 7 días.
4. Transparencia para vendedor con métricas, ventas y reglas de comisión.
5. Roadmap claro (integración logística y automatización en fase 2).

---

## 12) Backlog técnico recomendado (siguiente fase)

1. Endpoint para actualización de `shippingStatus` por vendedor con auditoría.
2. Módulo de liquidaciones (`payoutStatus`, `holdUntil`, `releasedAt`).
3. Servicio de notificaciones (email/in-app) por cambio de estado de orden.
4. Integración logística única (sandbox → producción) con tracking.
5. Panel de disputas/devoluciones para admin.
