import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Urban Hat",
    short_name: "UrbanHat",
    description: "Tienda Urban Hat para web y app instalable en escritorio y móvil",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#111827",
    orientation: "portrait",
    lang: "es-MX",
    categories: ["shopping", "lifestyle", "business"],
    icons: [
      {
        src: "/logo.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  }
}
