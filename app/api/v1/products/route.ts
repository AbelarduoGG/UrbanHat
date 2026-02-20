import { NextRequest, NextResponse } from "next/server"
import { createProductSchema } from "@/lib/validations/product.schema"
import {
  createProduct,
  getAllProducts,
  getProductsBySeller,
} from "@/lib/services/product.service"
import type { ApiResponse, ProductPublic } from "@/lib/types"
import { getRequestAuth } from "@/lib/auth/request-auth"

/**
 * GET /api/v1/products
 * Lista todos los productos activos (para la app móvil).
 */
export async function GET(_req: NextRequest) {
  try {
    const auth = getRequestAuth(_req)
    const sellerOnly = _req.nextUrl.searchParams.get("mine") === "true"

    if (sellerOnly) {
      if (!auth) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Se requiere autenticación" },
          { status: 401 }
        )
      }

      if (auth.role !== "seller") {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Solo vendedores pueden consultar sus productos" },
          { status: 403 }
        )
      }
    }

    const products = sellerOnly
      ? await getProductsBySeller(auth!.userId)
      : await getAllProducts()

    const data: ProductPublic[] = products.map((p) => ({
      id: p._id.toString(),
      sellerId: p.sellerId.toString(),
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      category: p.category,
      isActive: p.isActive,
    }))

    return NextResponse.json<ApiResponse<ProductPublic[]>>(
      { success: true, data },
      { status: 200 }
    )
  } catch (error) {
    console.error("[GET /api/v1/products]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/products
 * Crea producto para vendedor autenticado.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    if (auth.role !== "seller") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Solo vendedores pueden crear productos" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const product = await createProduct({
      ...parsed.data,
      sellerId: auth.userId,
      isActive: true,
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: product._id.toString(),
          sellerId: product.sellerId.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
          category: product.category,
          isActive: product.isActive,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/v1/products]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
