import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, createUser } from "@/lib/services/auth.service"
import type { ApiResponse } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const seedKey = req.headers.get("x-seed-key")

    if (!seedKey || seedKey !== process.env.ADMIN_SEED_KEY) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    const email = process.env.SUPERADMIN_EMAIL
    const password = process.env.SUPERADMIN_PASSWORD
    const name = process.env.SUPERADMIN_NAME ?? "Super Admin"

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Configura SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD en .env.local",
        },
        { status: 400 }
      )
    }

    const existing = (await findUserByEmail(email)) as
      | { _id: { toString: () => string }; email: string }
      | null

    if (existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { created: false, id: existing._id.toString(), email: existing.email },
        },
        { status: 200 }
      )
    }

    const user = await createUser({
      name,
      email,
      password,
      role: "superadmin",
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { created: true, id: user._id.toString(), email: user.email },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/v1/admin/seed-superadmin]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
