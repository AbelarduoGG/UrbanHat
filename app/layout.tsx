import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Oswald } from "next/font/google"
import RegisterSW from "@/components/RegisterSW" // ✅ IMPORT ARRIBA

import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" })

export const metadata: Metadata = {
  title: "Urban Hat | Gorras Urbanas",
  description:
    "Gorras urbanas de alta calidad. Estilo streetwear para quienes marcan tendencia. EST. FEB. 2026",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo-192.png",
    apple: "/logo-192.png",
    shortcut: "/logo-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#111827",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* ✅ MANIFEST */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo-192.png" />
        <link rel="shortcut icon" href="/logo-192.png" />
        <link rel="apple-touch-icon" href="/logo-192.png" />
      </head>

      <body className={`${_inter.variable} ${_oswald.variable}`}>
        {/* ✅ REGISTRO DEL SERVICE WORKER */}
        <RegisterSW />

        {children}
      </body>
    </html>
  )
}