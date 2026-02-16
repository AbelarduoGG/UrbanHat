import { NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/services/product.service"
import type { ApiResponse, ProductPublic } from "@/lib/types"

/**
 * GET /api/v1/products
 * Lista todos los productos activos (para la app móvil).
 */
export async function GET(_req: NextRequest) {
  try {
    const products = await getAllProducts()

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
