import { NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"
import { AUTH_COOKIE_NAME } from "@/lib/auth/session"

export async function POST() {
  const response = NextResponse.json<ApiResponse>({ success: true }, { status: 200 })

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}
