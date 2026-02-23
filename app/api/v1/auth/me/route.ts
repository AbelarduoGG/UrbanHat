import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { getUserById } from "@/lib/services/auth.service"

export async function GET(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autenticado" },
        { status: 200 }
      )
    }

    const user = (await getUserById(auth.userId)) as
      | {
          _id: { toString: () => string }
          name: string
          email: string
          role: "superadmin" | "seller" | "buyer"
          shopName?: string
          telefono?: string
          direccion?: string
          ciudad?: string
          estado?: string
          codigoPostal?: string
          isActive: boolean
          createdAt: Date
        }
      | null

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
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
          telefono: user.telefono,
          direccion: user.direccion,
          ciudad: user.ciudad,
          estado: user.estado,
          codigoPostal: user.codigoPostal,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[GET /api/v1/auth/me]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
