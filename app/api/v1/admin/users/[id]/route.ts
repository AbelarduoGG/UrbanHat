import { NextRequest, NextResponse } from "next/server"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"
import { adminUpdateUserSchema } from "@/lib/validations/user.schema"
import type { ApiResponse } from "@/lib/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, context: RouteParams) {
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
        { success: false, error: "Solo superadmin puede actualizar usuarios" },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await req.json()
    const parsed = adminUpdateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    if (!parsed.data.role && parsed.data.isActive === undefined) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No hay cambios para aplicar" },
        { status: 400 }
      )
    }

    await connectDB()
    const targetUser = await User.findById(id)

    if (!targetUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    if (targetUser.role === "superadmin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se puede modificar otro superadmin" },
        { status: 403 }
      )
    }

    if (parsed.data.role) {
      targetUser.role = parsed.data.role
      if (parsed.data.role !== "seller") {
        targetUser.shopName = undefined
      }
    }

    if (parsed.data.isActive !== undefined) {
      targetUser.isActive = parsed.data.isActive
    }

    await targetUser.save()

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: targetUser._id.toString(),
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          shopName: targetUser.shopName,
          isActive: targetUser.isActive,
          createdAt: targetUser.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PATCH /api/v1/admin/users/:id]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
