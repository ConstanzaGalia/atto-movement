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

/** Altitud de prueba fija de marca (San Javier / Yerba Buena) */
export const TEST_ALTITUDE = "432M"
export const TEST_ELEVATION_GAIN = "D+ 850"

/** Copy de tienda — voz de corredor / trail */
export const KIT_LABEL = "Kit de corredor"
export const KIT_LABEL_SHORT = "KIT"
export const KIT_EMPTY_TITLE = "Tu kit está vacío"
export const KIT_EMPTY_SUBTITLE = "No hay gear en el registro de salida"
export const KIT_TELEMETRY = "KIT TERMINAL"
export const ADD_TO_KIT = "SUMAR AL KIT"
export const ADDING_TO_KIT = "SUMANDO..."
export const CONFIRM_EXIT = "FINALIZAR COMPRA"
export const CONFIRM_EXIT_CTA = "CONTINUAR AL PAGO"
export const CHECKOUT_LABEL = "CONFIRMAR PEDIDO"
export const CONTINUE_ON_TRAIL = "SEGUIR EN EL SENDERO"
export const EXIT_BRIEFING = "RESUMEN DEL PEDIDO"
export const FEATURED_GEAR = "Gear de salida"
export const FEATURED_GEAR_EMPTY = "No hay gear de salida en este momento."
export const SHIPPING_LABEL = "Despacho"
export const FREE_SHIPPING_REACHED = "¡TENÉS DESPACHO GRATIS A CUMBRE ASEGURADO!"
export const freeShippingRemaining = (amountFormatted: string) =>
  `FALTAN $ ${amountFormatted} PARA DESPACHO GRATIS A CUMBRE`
export const STOCK_IN_BASE = "UNIDADES EN BASE"
export const STOCK_OUT_OF_BASE = "SIN UNIDADES EN BASE"
export const CART_EMPTY_ERROR = "El kit está vacío"
export const CART_ITEM_UNAVAILABLE_ERROR = "Un producto del kit ya no está disponible"
export const CART_QTY_INVALID_ERROR = "Cantidad inválida en el kit"
export const ADD_TO_KIT_ERROR = "No se pudo sumar al kit"

export const NAV_LINKS = [
  { href: "/tienda", label: "COLECCIÓN" },
  { href: "/tienda", label: "CATEGORÍAS" },
  { href: "/tienda", label: "TRAIL & RUN" },
  { href: "/#lookbook", label: "LOOKBOOK" },
  { href: "/tienda", label: "SPECS GEAR" },
  { href: "/sobre-mi", label: "SOBRE ATTO" },
] as const
