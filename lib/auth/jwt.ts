import jwt from "jsonwebtoken"

export interface JwtPayload {
  sub: string
  email: string
  role: "superadmin" | "seller" | "buyer"
  name: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("Define JWT_SECRET en .env.local")
  }

  return secret
}

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" })
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload
  } catch {
    return null
  }
}
