import { NextRequest, NextResponse } from "next/server"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { updateProductSchema } from "@/lib/validations/product.schema"
import { deleteProduct, updateProduct } from "@/lib/services/product.service"
import type { ApiResponse } from "@/lib/types"

interface RouteParams {
  params: { id: string }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
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
        { success: false, error: "Solo vendedores pueden editar productos" },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await req.json()
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const updates = {
      ...parsed.data,
      ...(parsed.data.imageUrls?.length
        ? { imageUrl: parsed.data.imageUrls[0] }
        : {}),
    }

    const product = await updateProduct(id, auth.userId, updates)

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Producto no encontrado o no pertenece al vendedor",
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          ...product,
          imageUrl: product?.imageUrls?.[0] || product?.imageUrl,
          imageUrls: product?.imageUrls?.length
            ? product.imageUrls
            : product?.imageUrl
              ? [product.imageUrl]
              : [],
          status: product?.status || "active",
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PATCH /api/v1/products/:id]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
        { success: false, error: "Solo vendedores pueden eliminar productos" },
        { status: 403 }
      )
    }

    const { id } = params
    const product = await deleteProduct(id, auth.userId)

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Producto no encontrado o no pertenece al vendedor",
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({ success: true, data: product }, { status: 200 })
  } catch (error) {
    console.error("[DELETE /api/v1/products/:id]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}