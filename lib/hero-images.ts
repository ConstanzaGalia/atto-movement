export type HeroImage = {
  id?: string
  slot_index: number
  image_url: string
  alt_text: string | null
  visible_on_mobile: boolean
  display_order: number
}

export const DEFAULT_HERO_IMAGES: HeroImage[] = [
  { slot_index: 1, image_url: "/collage1.jpeg", alt_text: "Atto Outfit 1", visible_on_mobile: true, display_order: 1 },
  { slot_index: 2, image_url: "/collage3.jpeg", alt_text: "Atto Outfit 3", visible_on_mobile: false, display_order: 2 },
  { slot_index: 3, image_url: "/collage4.jpeg", alt_text: "Atto Outfit 4", visible_on_mobile: true, display_order: 3 },
  { slot_index: 4, image_url: "/collage6.jpeg", alt_text: "Atto Outfit 6", visible_on_mobile: true, display_order: 4 },
  { slot_index: 5, image_url: "/collage2.jpeg", alt_text: "Atto Outfit 2", visible_on_mobile: false, display_order: 5 },
  { slot_index: 6, image_url: "/collage5.jpeg", alt_text: "Atto Outfit 5", visible_on_mobile: true, display_order: 6 },
]

export function normalizeHeroImages(rows: HeroImage[] | null | undefined): HeroImage[] {
  if (!rows || rows.length === 0) {
    return DEFAULT_HERO_IMAGES
  }
  return [...rows].sort((a, b) => a.display_order - b.display_order)
}
