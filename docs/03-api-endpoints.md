### Archivo 3: `docs/03-api-endpoints.md`
El contrato para que la App Móvil funcione sin problemas.

```markdown
# 03. API Contract (Endpoints para Móvil)

Todas las respuestas son en formato JSON.
Base URL: `https://tu-dominio-vercel.app/api`

## Autenticación
### POST `/api/auth/login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Response Success (200):**
  ```json
  {
    "success": true,
    "user": { "id": "123", "name": "Juan", "email": "...", "role": "buyer" }
  }