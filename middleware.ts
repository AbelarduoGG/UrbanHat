import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, parseSession } from "@/lib/auth/session"

function isWebProtectedPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/cuenta")
}

function isOrdersApi(pathname: string) {
  return pathname.startsWith("/api/v1/orders")
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const session = parseSession(req.cookies.get(AUTH_COOKIE_NAME)?.value)

  if (isWebProtectedPath(pathname)) {
    if (pathname.startsWith("/admin")) {
      if (session) {
        const allowedRoles = ["superadmin", "seller"]
        if (!allowedRoles.includes(session.role)) {
          return NextResponse.redirect(new URL("/", req.url))
        }
      }
    } else if (!session) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("next", `${pathname}${search}`)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (isOrdersApi(pathname)) {
    const buyerHeader = req.headers.get("x-user-id")
    if (!session && !buyerHeader) {
      return NextResponse.json(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*", "/api/v1/orders/:path*"],
}
