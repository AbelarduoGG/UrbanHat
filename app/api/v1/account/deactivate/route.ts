import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME } from "@/lib/auth/session"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { deactivateUserAccount } from "@/lib/services/auth.service"
import type { ApiResponse } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    if (auth.role === "superadmin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Superadmin no puede desactivarse desde este flujo" },
        { status: 403 }
      )
    }

    const user = await deactivateUserAccount(auth.userId)

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const response = NextResponse.json<ApiResponse>(
      { success: true, data: { deactivated: true } },
      { status: 200 }
    )

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("[POST /api/v1/account/deactivate]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
