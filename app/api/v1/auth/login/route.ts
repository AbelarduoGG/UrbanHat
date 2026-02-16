import { NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations/auth.schema"
import { findUserByEmail } from "@/lib/services/auth.service"
import type { ApiResponse, UserPublic } from "@/lib/types"

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

    const user = await findUserByEmail(parsed.data.email)

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    // TODO: Comparar con bcrypt.compare(parsed.data.password, user.password)
    if (user.password !== parsed.data.password) {
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

    return NextResponse.json<ApiResponse<UserPublic>>(
      { success: true, data: userPublic },
      { status: 200 }
    )
  } catch (error) {
    console.error("[POST /api/v1/auth/login]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
