type SupabaseLikeError = {
  code?: string
  message?: string
} | null | undefined

export function getSupabaseErrorMessage(
  error: SupabaseLikeError,
  fallback: string,
  context?: { color?: string },
): string {
  const message = error?.message ?? ""
  const code = error?.code ?? ""

  if (
    code === "23505" ||
    message.includes("product_variants_product_id_color_key")
  ) {
    const color = context?.color?.trim()
    return color
      ? `Ya existe una variante con el color "${color}" para este producto.`
      : "Ya existe una variante con ese color para este producto."
  }

  if (
    message.includes("row-level security") ||
    message.includes("violates row-level security policy")
  ) {
    return "No tenés permisos para esta acción. Verificá que estés logueada como admin."
  }

  return message || fallback
}
