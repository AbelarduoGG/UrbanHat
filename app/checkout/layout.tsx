import React from "react"
import { CartProvider } from "@/lib/cart-context"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
}
