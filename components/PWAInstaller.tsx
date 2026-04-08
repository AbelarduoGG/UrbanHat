"use client"

import { useEffect } from "react"

export function PWAInstaller() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ SW registrado"))
        .catch((err) => console.log("❌ SW error", err))
    }
  }, [])

  return null
}