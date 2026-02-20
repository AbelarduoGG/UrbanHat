import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { updateAddressSchema } from "@/lib/validations/user.schema"
import { updateUserAddress } from "@/lib/services/auth.service"

export async function PUT(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    if (auth.role !== "buyer") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Solo compradores pueden editar dirección" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = updateAddressSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const updated = (await updateUserAddress(auth.userId, parsed.data)) as
      | {
          _id: { toString: () => string }
          direccion?: string
          ciudad?: string
          estado?: string
          codigoPostal?: string
          telefono?: string
        }
      | null

    if (!updated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: updated._id.toString(),
          direccion: updated.direccion,
          ciudad: updated.ciudad,
          estado: updated.estado,
          codigoPostal: updated.codigoPostal,
          telefono: updated.telefono,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PUT /api/v1/account/address]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
