export const SITE_NAME = "Atto"
export const SITE_NAME_FULL = "Atto Labs"
export const SITE_TAGLINE = "Pensada para quienes eligen salir."
export const SITE_DESCRIPTION =
  "Equipamiento técnico de trail running y fast-packing nacido en Tucumán. Transpirabilidad, resistencia ripstop y peso ultrapluma."

export const WHATSAPP_NUMBER = "5493815415364"
export const WHATSAPP_DISPLAY = "+54 9 3815 41-5364"
export const WHATSAPP_PREFILL =
  "Hola Atto, vengo de la web y quiero consultarte por lo siguiente:"
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`

export const MARQUEE_DEFAULT =
  "ENVÍOS A TODO EL PAÍS // PENSADA PARA QUIENES ELIGEN SALIR // ATTO LABS"

export const FOOTER_BLURB =
  "Tucumán, Argentina — Technical Trail Running & Fast-Packing Athletics."

export const FOOTER_COORDS = "LAT: -26.8241° // LON: -65.2226° // ALT: 432M"

export const FREE_SHIPPING_THRESHOLD = 50000

/** Default shipping base when site_settings is unavailable */
export const DEFAULT_SHIPPING_BASE_COST = 5000

export const RELEASE_META = "RELEASE // SS 24/25"
export const LOC_META = "LOC: SAN JAVIER / YERBA BUENA"

export const NAV_LINKS = [
  { href: "/tienda", label: "COLECCIÓN" },
  { href: "/tienda", label: "CATEGORÍAS" },
  { href: "/tienda", label: "TRAIL & RUN" },
  { href: "/#lookbook", label: "LOOKBOOK" },
  { href: "/tienda", label: "SPECS GEAR" },
  { href: "/sobre-mi", label: "SOBRE ATTO" },
] as const
