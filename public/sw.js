const CACHE_NAME = "urbanhat-v8"
const API_CACHE = "urbanhat-api-v4"

// INSTALAR
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

// ACTIVAR
self.addEventListener("activate", (event) => {
  clients.claim()
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// FETCH
self.addEventListener("fetch", (event) => {
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    return
  }

  const url = new URL(event.request.url)

  // 🔥 HTML (navegación)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    )
    return
  }

  // 🔥 ARCHIVOS DE NEXT (CSS, JS)
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached

        const response = await fetch(event.request)
        cache.put(event.request, response.clone())
        return response
      })
    )
    return
  }

  // 🔥 IMÁGENES
  if (event.request.destination === "image") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached

        const response = await fetch(event.request)
        cache.put(event.request, response.clone())
        return response
      })
    )
    return
  }

  // 🔥 API PRODUCTOS
  if (url.pathname.includes("/api/v1/products")) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)

        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
          .catch(() => null)

        return cached || fetchPromise
      })
    )
    return
  }

  // 🔥 NO CACHEAR APIs de orders
  if (url.pathname.includes("/api/v1/orders")) {
    return
  }

  // 🔥 OTRAS APIs (no cachear)
  if (url.pathname.startsWith("/api/")) {
    return
  }
})