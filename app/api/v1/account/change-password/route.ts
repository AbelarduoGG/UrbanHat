import { NextRequest, NextResponse } from "next/server"
import { changePasswordSchema } from "@/lib/validations/auth.schema"
import {
  comparePassword,
  getUserWithPasswordById,
  updateUserPassword,
} from "@/lib/services/auth.service"
import { getRequestAuth } from "@/lib/auth/request-auth"
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

    const body = await req.json()
    const parsed = changePasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const user = await getUserWithPasswordById(auth.userId)

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const validCurrent = await comparePassword(
      parsed.data.currentPassword,
      user.password
    )

    if (!validCurrent) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "La contraseña actual no es válida" },
        { status: 401 }
      )
    }

    await updateUserPassword(auth.userId, parsed.data.newPassword)

    return NextResponse.json<ApiResponse>(
      { success: true, data: { updated: true } },
      { status: 200 }
    )
  } catch (error) {
    console.error("[POST /api/v1/account/change-password]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
