import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAME, parseSession, type SessionRole } from "@/lib/auth/session"
import { verifyAuthToken } from "@/lib/auth/jwt"

export interface RequestAuth {
  userId: string
  role: SessionRole
  source: "cookie" | "jwt" | "x-user-id"
}

export function getRequestAuth(req: NextRequest): RequestAuth | null {
  const session = parseSession(req.cookies.get(AUTH_COOKIE_NAME)?.value)
  if (session) {
    return {
      userId: session.id,
      role: session.role,
      source: "cookie",
    }
  }

  const authorization = req.headers.get("authorization")
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.replace("Bearer ", "").trim()
    const payload = verifyAuthToken(token)

    if (payload) {
      return {
        userId: payload.sub,
        role: payload.role,
        source: "jwt",
      }
    }
  }

  const buyerId = req.headers.get("x-user-id")
  if (buyerId) {
    return {
      userId: buyerId,
      role: "buyer",
      source: "x-user-id",
    }
  }

  return null
}
