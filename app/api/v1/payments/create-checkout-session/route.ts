import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Product } from "@/lib/db/models"
import { connectDB } from "@/lib/db/connection"
import { getRequestAuth } from "@/lib/auth/request-auth"
import type { ApiResponse } from "@/lib/types"

const SHIPPING_COST = 99
const FREE_SHIPPING_MIN = 999

interface CheckoutBody {
  origin?: string
  items: Array<{ productId: string; quantity: number }>
}

interface CheckoutProduct {
  name: string
  price: number
  isActive: boolean
  status: "active" | "paused" | "archived"
  imageUrls: string[]
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_KEY || process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("Configura STRIPE_KEY en variables de entorno")
  }

  return new Stripe(secretKey)
}

export async function POST(req: NextRequest) {
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
        { success: false, error: "Solo compradores pueden pagar" },
        { status: 403 }
      )
    }

    const body = (await req.json()) as CheckoutBody

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El carrito está vacío" },
        { status: 400 }
      )
    }

    await connectDB()

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let subtotal = 0

    for (const item of body.items) {
      if (!item?.productId || !item?.quantity || item.quantity < 1) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Carrito inválido" },
          { status: 400 }
        )
      }

      const product = await Product.findOne({ _id: item.productId })
        .select("name price isActive status imageUrls")
        .lean<CheckoutProduct | null>()

      if (!product || !product.isActive || product.status !== "active") {
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Producto no disponible: ${item.productId}` },
          { status: 400 }
        )
      }

      const unitPrice = Number(product.price)
      subtotal += unitPrice * item.quantity

      lineItems.push({
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(unitPrice * 100),
          product_data: {
            name: product.name,
            images: product.imageUrls?.length ? [product.imageUrls[0]] : undefined,
          },
        },
        quantity: item.quantity,
      })
    }

    if (subtotal < FREE_SHIPPING_MIN) {
      lineItems.push({
        price_data: {
          currency: "mxn",
          unit_amount: SHIPPING_COST * 100,
          product_data: {
            name: "Envío",
          },
        },
        quantity: 1,
      })
    }

    const stripe = getStripeClient()

    const fallbackOrigin = req.nextUrl.origin
    const origin = body.origin?.startsWith("http") ? body.origin : fallbackOrigin

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        buyerId: auth.userId,
      },
      success_url: `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?status=cancel`,
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          url: session.url,
          sessionId: session.id,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    console.error("[POST /api/v1/payments/create-checkout-session]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
