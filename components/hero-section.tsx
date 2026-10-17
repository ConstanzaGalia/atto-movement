import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LOC_META, RELEASE_META, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/brand"

export function HeroSection() {
  return (
    <section className="relative w-full bg-white border-b border-neutral-200 overflow-hidden">
      <div className="relative z-10 w-full px-atto pt-6 pb-2 flex flex-wrap items-center justify-between gap-4 font-technical-micro text-atto-secondary border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-black inline-block animate-pulse" />
          <span className="text-black font-bold">{RELEASE_META}</span>
          <span className="text-neutral-300">/</span>
          <span>ATTO RUNNING LABS TUC</span>
        </div>
        <div className="flex items-center gap-6 text-atto-secondary">
          <span>{LOC_META}</span>
          <span className="hidden md:inline">ELEVATION GAIN: +1240M</span>
          <span className="text-black font-semibold border-b border-black">TUC-ARG</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-neutral-100">
        <Image
          src="/hero-atto-desktop.png"
          alt="Atto — corredor en movimiento"
          width={1024}
          height={533}
          priority
          className="hidden md:block w-full h-auto"
          sizes="100vw"
        />
        <Image
          src="/hero-atto-mobile.png"
          alt="Atto — corredor en movimiento"
          width={720}
          height={533}
          priority
          className="block md:hidden w-full h-auto"
          sizes="100vw"
        />
      </div>

      <div className="relative z-10 w-full px-atto py-10 lg:py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 p-6 sm:p-7 bg-white border border-neutral-300 shadow-xl shadow-neutral-200/60">
            <div className="flex items-center gap-2 font-technical-micro text-atto-secondary mb-3">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>ORIGEN: NORTE ARGENTINO</span>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl text-black uppercase font-extrabold tracking-tight mb-3 leading-tight">
              {SITE_TAGLINE}
            </h1>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{SITE_DESCRIPTION}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/tienda"
                className="inline-flex items-center justify-center gap-2 bg-black text-white font-technical-data uppercase font-semibold py-3.5 px-6 hover:bg-neutral-800 transition-colors"
              >
                EXPLORAR CATÁLOGO
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#lookbook"
                className="inline-flex items-center justify-center gap-2 bg-neutral-100 border border-neutral-300 text-black font-technical-data uppercase font-semibold py-3.5 px-5 hover:bg-neutral-200 transition-colors"
              >
                LOOKBOOK 24
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-neutral-300 p-5 space-y-3 shadow-sm">
            <div className="font-technical-micro text-black flex items-center justify-between border-b border-neutral-200 pb-2">
              <span>MATRIZ TÉCNICA</span>
              <span className="w-1.5 h-1.5 bg-black" />
            </div>
            {[
              ["FABRIC", "AEROPOLYMER 74G"],
              ["BREATHABILITY", "OPTIMAL ACTIVE"],
              ["TESTED IN", "YUNGAS DE TUCUMÁN"],
              ["WEIGHT CLASS", "ULTRA / TEMPO"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between py-1.5 bg-neutral-50 border border-neutral-200 px-2.5 font-technical-micro"
              >
                <span className="text-neutral-500">{label}</span>
                <span className="text-black font-semibold">{value}</span>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 flex flex-col justify-between gap-4 p-5 bg-surface-container-low border border-surface-container-high">
            <div>
              <p className="font-technical-micro text-atto-secondary mb-2">SPEC // SERIES</p>
              <p className="font-display font-bold text-sm uppercase tracking-wider text-black">
                100% HIGH TENACITY DRY MATRIX
              </p>
              <p className="font-technical-micro text-atto-secondary mt-2">
                SERIE 004 // TUCUMÁN RUNNERS CREW
              </p>
            </div>
            <Link
              href="/sobre-mi"
              className="font-label-caps text-black border-b border-black w-fit pb-0.5 hover:opacity-70"
            >
              SOBRE ATTO →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
