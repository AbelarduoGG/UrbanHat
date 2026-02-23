import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { ApiResponse } from "@/lib/types"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { updateUserProfile } from "@/lib/services/auth.service"

const updateProfileSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  apellido: z.string().min(2, "El apellido es obligatorio"),
  telefono: z.string().min(8, "Teléfono inválido").optional().or(z.literal("")),
})

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
        { success: false, error: "Solo compradores pueden editar su perfil" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const name = `${parsed.data.nombre} ${parsed.data.apellido}`.trim()

    const updated = (await updateUserProfile(auth.userId, {
      name,
      telefono: parsed.data.telefono || undefined,
    })) as
      | {
          _id: { toString: () => string }
          name: string
          email: string
          role: "superadmin" | "seller" | "buyer"
          telefono?: string
          direccion?: string
          ciudad?: string
          estado?: string
          codigoPostal?: string
          isActive: boolean
          createdAt: Date
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
          name: updated.name,
          email: updated.email,
          role: updated.role,
          telefono: updated.telefono,
          direccion: updated.direccion,
          ciudad: updated.ciudad,
          estado: updated.estado,
          codigoPostal: updated.codigoPostal,
          isActive: updated.isActive,
          createdAt: updated.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PUT /api/v1/account/profile]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
