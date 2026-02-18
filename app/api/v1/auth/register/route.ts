import { NextRequest, NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations/auth.schema"
import { findUserByEmail, createUser } from "@/lib/services/auth.service"
import type { ApiResponse, UserPublic } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const existing = await findUserByEmail(parsed.data.email)

    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El email ya está registrado" },
        { status: 409 }
      )
    }

    const user = await createUser(parsed.data)

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
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/v1/auth/register]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
