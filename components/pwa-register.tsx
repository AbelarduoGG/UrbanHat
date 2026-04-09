"use client"

import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    // In development, stale SW caches can keep old CSS/JS and break visual QA.
    if (process.env.NODE_ENV !== "production") {
      void (async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map((registration) => registration.unregister()))

          if ("caches" in window) {
            const cacheKeys = await caches.keys()
            await Promise.all(cacheKeys.map((key) => caches.delete(key)))
          }
        } catch {
          // no-op
        }
      })()
      return
    }

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => undefined)
  }, [])

  return null
}
