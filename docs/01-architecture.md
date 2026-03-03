# 01. Arquitectura del Proyecto (Urban Hat)

## Resumen Ejecutivo
Urban Hat es una plataforma de comercio electrónico híbrida ("Marketplace") que conecta a múltiples vendedores con compradores finales. El sistema utiliza una arquitectura de "Monolito Modular" optimizada para el despliegue en Vercel.

## Stack Tecnológico
- **Frontend Web (Admin & Vendedores):** Next.js 14+ (App Router), React, TailwindCSS.
- **Backend / API:** Next.js Server Actions (para la web) y Route Handlers (para la API/PWA).
- **Base de Datos:** MongoDB Atlas (Mongoose ODM).
- **Cliente instalable:** PWA (Web App Manifest) para celular, tablet y escritorio.
- **Lenguaje:** TypeScript (Web/API).

## Estrategia de Separación de Roles
El sistema maneja tres roles distintos en la misma base de datos, pero con accesos separados:

### 1. Plataforma Web (Dashboard SaaS)
**Usuarios:** Super Admin (Dueños) y Vendedores.
**Tecnología:** Server Side Rendering (SSR) + Server Actions.
**Funcionalidad:**
- **Super Admin:** Visión global de ventas, gestión de usuarios (banear vendedores/compradores).
- **Vendedor:**
    - Gestión de inventario propio (CRUD de productos).
    - Visualización de ventas propias y cálculo de ganancias (Precio venta - Comisión plataforma).

### 2. Plataforma Cliente (PWA instalable)
**Usuarios:** Compradores (Clientes finales).
**Tecnología:** Sitio web instalable desde navegador mediante `manifest.webmanifest`.
**Funcionalidad:**
- Catálogo unificado (feed de todos los vendedores).
- Carrito de compras y Checkout.
- Historial de pedidos personal.

## Flujo de Datos
1.  **Web:** El navegador se comunica directamente con la DB vía Server Actions (sin API intermedia).
2.  **Cliente instalable (PWA):** La app instalada desde navegador consume `/api/v1/products`, `/api/v1/orders`, etc.