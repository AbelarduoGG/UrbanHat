import { NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations/auth.schema"
import { validateUserCredentials } from "@/lib/services/auth.service"
import type { ApiResponse, UserPublic } from "@/lib/types"
import { AUTH_COOKIE_NAME, serializeSession } from "@/lib/auth/session"
import { signAuthToken } from "@/lib/auth/jwt"

type AuthUser = {
  _id: { toString: () => string }
  name: string
  email: string
  role: "superadmin" | "seller" | "buyer"
  shopName?: string
  isActive: boolean
  createdAt: Date
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const user = (await validateUserCredentials(
      parsed.data.email,
      parsed.data.password
    )) as AuthUser | null

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cuenta desactivada" },
        { status: 403 }
      )
    }

    const userPublic: UserPublic = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      shopName: user.shopName,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    }

    const token = signAuthToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    const response = NextResponse.json<ApiResponse<UserPublic & { token: string }>>(
      { success: true, data: { ...userPublic, token } },
      { status: 200 }
    )

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: serializeSession({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("[POST /api/v1/auth/login]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
