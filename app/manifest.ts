import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Urban Hat",
    short_name: "UrbanHat",
    description: "Tienda Urban Hat para web y app instalable",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#111827",
    orientation: "portrait",
    lang: "es-MX",
    categories: ["shopping", "lifestyle", "business"],
    icons: [
      {
        src: "/logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-desktop.png",
        sizes: "1884x975",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshot-mobile.png",
        sizes: "899x963",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  }
}
