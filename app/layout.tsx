import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Mono, Inter, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ClientLayout } from "@/components/client-layout"
import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_FULL, SITE_TAGLINE } from "@/lib/brand"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const imageUrl = `${siteUrl}/icon-atto.png`

export const metadata: Metadata = {
  title: `${SITE_NAME_FULL} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  generator: "Next.js",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-atto.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-atto.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: `${SITE_NAME_FULL} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: SITE_NAME_FULL,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Trail Running Tucumán`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME_FULL} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [imageUrl],
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}
