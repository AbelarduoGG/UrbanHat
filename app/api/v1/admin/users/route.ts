import { NextRequest, NextResponse } from "next/server"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"
import type { ApiResponse } from "@/lib/types"

export async function GET(req: NextRequest) {
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
        { success: false, error: "Solo superadmin puede listar usuarios" },
        { status: 403 }
      )
    }

    await connectDB()
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json<ApiResponse>({ success: true, data: users }, { status: 200 })
  } catch (error) {
    console.error("[GET /api/v1/admin/users]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
