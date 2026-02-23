# AGENTS.md — Reglas de colaboración con Copilot (UrbanHat)

Este archivo define cómo debe comportarse Copilot durante el desarrollo del proyecto.

## 1) Principios generales

1. Mantener cambios pequeños, enfocados y trazables.
2. Respetar separación de responsabilidades por carpeta.
3. Priorizar seguridad, consistencia de datos y mantenibilidad.
4. No introducir complejidad innecesaria para features escolares/MVP.
5. Toda decisión técnica debe favorecer escalabilidad progresiva.

## 2) Alcance por responsable

- **Backend (Josué):** `app/api/v1/**`, `lib/db/**`, `lib/services/**`, `lib/validations/**`, `lib/types/**`.
- **Frontend (compañero):** `app/**` (vistas), `components/**`, `hooks/**`, `lib/*-context.tsx`.

Copilot debe evitar mezclar responsabilidades sin justificarlo.

## 3) Arquitectura obligatoria

Al implementar nuevas funcionalidades de backend, seguir siempre:

1. **Validación** en `lib/validations/*.ts` (Zod).
2. **Ruta HTTP** en `app/api/v1/**/route.ts` solo como orquestador.
3. **Lógica de negocio** en `lib/services/*.ts`.
4. **Persistencia** con modelos en `lib/db/models/*.ts`.
5. **Respuesta API estándar**:

```ts
{ success: boolean, data?: unknown, error?: string }
```

## 4) Estándares de seguridad

1. Nunca almacenar ni comparar contraseñas en texto plano.
2. Usar `bcryptjs` para hash/compare.
3. No exponer campos sensibles (`password`) en respuestas.
4. Validar siempre entradas de API con Zod.
5. Manejar errores con códigos HTTP correctos y mensajes claros.

## 5) Convenciones API para Android

1. Mantener prefijo `/api/v1` para todos los endpoints móviles.
2. Evitar cambios breaking sin actualizar `docs/03-api-endpoints.md`.
3. Cuando sea posible, preservar compatibilidad hacia atrás.
4. Documentar request/response de cada endpoint nuevo.

## 6) Gestión de cambios

1. No borrar archivos sin verificar uso mediante búsqueda previa.
2. Si se elimina algo, indicar motivo en PR o en `docs/`.
3. No editar `.env.local` automáticamente.
4. Si cambia estructura importante, actualizar documentación correspondiente.

## 7) Calidad mínima antes de cerrar tarea

Copilot debe intentar ejecutar validaciones proporcionales al cambio:

- Lint de archivos modificados.
- Build o pruebas si aplica.
- Reportar bloqueos claramente cuando no sea posible validar.

## 8) Restricciones explícitas

1. No crear features fuera de alcance solicitado.
2. No reescribir UI si el objetivo es backend.
3. No agregar dependencias sin necesidad real.
4. No romper el flujo actual del frontend mientras se migra a backend real.

## 9) Formato de respuesta esperado de Copilot

En cada entrega importante, incluir:

1. Qué cambió (resumen breve).
2. Archivos tocados.
3. Cómo probarlo.
4. Riesgos o pendientes.

---

Estas reglas aplican durante todo el desarrollo de UrbanHat.
