export const AUTH_COOKIE_NAME = "urbanhat_session"

export type SessionRole = "superadmin" | "seller" | "buyer"

export interface AuthSession {
  id: string
  name: string
  email: string
  role: SessionRole
}

export function serializeSession(session: AuthSession): string {
  return encodeURIComponent(JSON.stringify(session))
}

export function parseSession(cookieValue?: string): AuthSession | null {
  if (!cookieValue) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as AuthSession

    if (!parsed?.id || !parsed?.email || !parsed?.role) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}
