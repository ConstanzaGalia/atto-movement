import Image from "next/image"
import Link from "next/link"
import { SITE_DESCRIPTION, SITE_TAGLINE, WHATSAPP_URL } from "@/lib/brand"

export default function SobreMiPage() {
  return (
    <div className="min-h-screen">
      <div className="px-atto py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <p className="font-technical-micro text-atto-secondary mb-3">SOBRE ATTO // ORIGEN TUC</p>
          <h1 className="font-headline-lg uppercase tracking-tighter text-black mb-6">
            {SITE_TAGLINE}
          </h1>
          <p className="text-body-lg text-atto-secondary leading-relaxed max-w-2xl mb-12">
            {SITE_DESCRIPTION}
          </p>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">
            <div className="space-y-6">
              <h2 className="font-headline-md uppercase text-black">Nacidos en Tucumán</h2>
              <p className="text-body-md text-atto-secondary leading-relaxed">
                Atto Labs desarrolla indumentaria técnica de trail running y fast-packing desde el
                norte argentino. Cada prenda se piensa para humedad crítica, desnivel positivo y
                ritmo que no se negocia.
              </p>
              <p className="text-body-md text-atto-secondary leading-relaxed">
                No diseñamos para la vidriera: diseñamos para el sendero. Telas ultrapluma,
                costuras pensadas para fricción cero y una estética monócroma que prioriza la
                función.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/tienda"
                  className="inline-flex bg-black text-white font-label-caps px-6 py-3 hover:bg-neutral-800"
                >
                  EXPLORAR CATÁLOGO
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex border border-black font-label-caps px-6 py-3 hover:bg-surface-container-low"
                >
                  WHATSAPP DIRECTO
                </a>
              </div>
            </div>

            <div className="relative w-full aspect-[4/5] bg-surface-container-low border border-surface-container-high overflow-hidden">
              <Image
                src="/hero-atto-desktop.png"
                alt="Atto Labs — trail running"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="border-t border-black pt-10 grid sm:grid-cols-3 gap-6">
            {[
              ["LOC", "SAN JAVIER / YERBA BUENA"],
              ["FOCUS", "TRAIL // FAST-PACKING"],
              ["LAB", "ATTO MOVEMENT SYSTEMS"],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface-container-low p-4">
                <p className="font-technical-micro text-atto-secondary mb-1">{label}</p>
                <p className="font-technical-data font-bold text-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
