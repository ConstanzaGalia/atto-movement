import type { MetadataRoute } from "next"
import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_FULL, SITE_TAGLINE } from "@/lib/brand"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME_FULL} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#000000",
    lang: "es-AR",
    categories: ["shopping", "lifestyle", "sports"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-atto.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
