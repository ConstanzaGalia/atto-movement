"use client"

import Link from "next/link"
import { useState } from "react"
import { AttoLogo } from "@/components/atto/atto-logo"
import {
  FOOTER_BLURB,
  FOOTER_COORDS,
  KIT_LABEL,
  SITE_NAME_FULL,
  WHATSAPP_URL,
} from "@/lib/brand"

export function AttoSiteFooter() {
  const [email, setEmail] = useState("")

  return (
    <footer className="border-t border-surface-container-high bg-surface-container-lowest">
      <div className="px-atto py-12 lg:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <AttoLogo href="/" showBadge={false} />
            <p className="font-technical-data text-atto-secondary uppercase leading-relaxed">
              {FOOTER_BLURB}
            </p>
            <p className="font-technical-micro text-atto-secondary">{FOOTER_COORDS}</p>
          </div>

          <div>
            <h4 className="font-technical-micro text-atto-secondary mb-4">NAVEGACIÓN</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Inicio" },
                { href: "/tienda", label: "Colección" },
                { href: "/carrito", label: KIT_LABEL },
                { href: "/sobre-mi", label: "Sobre Atto" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="font-label-caps text-black hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-technical-micro text-atto-secondary mb-4">INDEX // LAB</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tienda" className="font-label-caps text-black hover:underline underline-offset-4">
                  Spec Gear
                </Link>
              </li>
              <li>
                <Link href="/#lookbook" className="font-label-caps text-black hover:underline underline-offset-4">
                  Lookbook
                </Link>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-label-caps text-black hover:underline underline-offset-4"
                >
                  Canal WhatsApp
                </a>
              </li>
              <li>
                <Link
                  href="/auth/admin-login"
                  className="font-label-caps text-atto-secondary hover:text-black"
                >
                  Acceso Lab
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-technical-micro text-atto-secondary mb-4">DESPACHO RÁPIDO</h4>
            <p className="font-technical-micro text-atto-secondary mb-4 leading-relaxed">
              Despacho a todo el país // 24–48h en zonas prioritarias
            </p>
            <form
              className="flex border border-surface-container-high"
              onSubmit={(e) => {
                e.preventDefault()
                setEmail("")
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="TU CORREO ELECTRÓNICO..."
                className="flex-1 bg-surface-container-low px-3 py-2.5 font-technical-micro text-black placeholder:text-outline focus:outline-none uppercase"
                required
              />
              <button
                type="submit"
                className="bg-black text-white font-label-caps px-4 py-2.5 hover:bg-neutral-800 transition-colors"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-surface-container-high flex flex-col sm:flex-row justify-between gap-3">
          <p className="font-technical-micro text-atto-secondary">
            © {new Date().getFullYear()} {SITE_NAME_FULL}. Todos los derechos reservados.
          </p>
          <p className="font-technical-micro text-atto-secondary">ATTO MOVEMENT SYSTEMS INC.</p>
        </div>
      </div>
    </footer>
  )
}
