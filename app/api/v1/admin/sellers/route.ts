import { NextRequest, NextResponse } from "next/server"
import { createSellerSchema } from "@/lib/validations/auth.schema"
import { registerOrReuseUser } from "@/lib/services/auth.service"
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

    if (auth.role !== "superadmin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Solo superadmin puede registrar vendedores" },
        { status: 403 }
      )
    }

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
      isActive: true,
    })

    if (registration.status === "active_exists") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El email ya está registrado" },
        { status: 409 }
      )
    }

    const seller = registration.user

    if (!seller) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se pudo registrar el vendedor" },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: seller._id.toString(),
          name: seller.name,
          email: seller.email,
          role: seller.role,
          shopName: seller.shopName,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/v1/admin/sellers]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
