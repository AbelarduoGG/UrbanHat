import { NextRequest, NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { getRequestAuth } from "@/lib/auth/request-auth"
import type { ApiResponse } from "@/lib/types"

const MAX_SIZE_BYTES = 5 * 1024 * 1024

function signCloudinary(paramsToSign: string, apiSecret: string) {
  return createHash("sha1").update(`${paramsToSign}${apiSecret}`).digest("hex")
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

    if (auth.role !== "seller" && auth.role !== "superadmin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No tienes permisos para subir imágenes" },
        { status: 403 }
      )
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Falta configurar CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET",
        },
        { status: 500 }
      )
    }

    const form = await req.formData()
    const file = form.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Debes adjuntar un archivo válido" },
        { status: 400 }
      )
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El archivo debe ser una imagen" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "La imagen no puede exceder 5MB" },
        { status: 400 }
      )
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = "urbanhat/products"
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
    const signature = signCloudinary(paramsToSign, apiSecret)

    const cloudinaryForm = new FormData()
    cloudinaryForm.append("file", file)
    cloudinaryForm.append("api_key", apiKey)
    cloudinaryForm.append("timestamp", String(timestamp))
    cloudinaryForm.append("folder", folder)
    cloudinaryForm.append("signature", signature)

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    )

    const uploadResult = await uploadResponse.json()

    if (!uploadResponse.ok || !uploadResult?.secure_url) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: uploadResult?.error?.message || "No se pudo subir la imagen",
        },
        { status: 502 }
      )
    }

    return NextResponse.json<ApiResponse<{ url: string }>>(
      {
        success: true,
        data: {
          url: uploadResult.secure_url,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[POST /api/v1/uploads/image]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
