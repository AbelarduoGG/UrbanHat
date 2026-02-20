import { NextRequest, NextResponse } from "next/server"
import { createSellerSchema } from "@/lib/validations/auth.schema"
import { registerOrReuseUser } from "@/lib/services/auth.service"
import type { ApiResponse } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSellerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const registration = await registerOrReuseUser({
      ...parsed.data,
      role: "seller",
      isActive: false,
    })

    if (registration.status === "active_exists") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El email ya está registrado" },
        { status: 409 }
      )
    }

    const user = registration.user

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se pudo registrar el vendedor" },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          shopName: user.shopName,
          isActive: user.isActive,
          message: "Registro enviado. Un administrador debe activar tu cuenta.",
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/v1/auth/register-seller]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
