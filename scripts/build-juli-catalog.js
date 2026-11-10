/**
 * Agrupa planilla Juli → docs de revisión + SQL de carga (sin ejecutar).
 * Run: node scripts/build-juli-catalog.js
 */
const fs = require("fs")
const path = require("path")

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "catalog-juli-raw.json"), "utf8")
)

/**
 * Códigos → nombres de lugares tucumanos / andinos.
 * Formato tienda: "Remera Muñoz", "Short Raco" (sin MAYÚSCULAS).
 * SKU interno sigue siendo el código de planilla.
 */
const REMERA_TRAIL_NAMES = {
  "4051S26": "Remera aconquija",
  "4052S26": "Remera ñuñorco",
  "4055S26": "Remera muñoz",
  "4056S26": "Remera pelao",
  "4057S26": "Remera negrito",
  "4062S26": "Remera tafí",
  "4066S26": "Remera el bolsón",
  "8360S26": "Remera infiernillo",
  "8369S26": "Remera mala mala",
  "8371S26": "Remera la ciénaga",
  "8383S26": "Remera raco",
  "8386S26": "Remera san javier",
  "8387S26": "Remera anfama",
  "8405S26": "Remera siambón",
  "8406S26": "Remera potrerillo",
  "8407S26": "Remera ampimpa",
  "8408S26": "Remera amaicha",
  "8415S26": "Remera lara",
  "8418S26": "Remera yerba buena",
  "8421S26": "Remera villa nougués",
  "8427S26": "Remera apacheta",
  "8428S26": "Remera abra",
  "8432S26": "Remera refugio",
  "8438S26": "Remera filo",
  "8466S26": "Remera travesía",
  "8468S26": "Remera cumbre",
  "8544S26": "Remera altura",
  "8555526": "Remera quebrada",
  "8564S26": "Remera sendero",
  "8588S26": "Remera vertiente",
}

const SHORT_TRAIL_NAMES = {
  "12961S26": "Short filo",
  "12962S26": "Short abra",
  "13024S26": "Short travesía",
}

function isCodeSku(value) {
  return /[0-9]/.test(value)
}

function normalizeSku(code) {
  return String(code).trim().toUpperCase().replace(/\s+/g, "-")
}

function displayName(category, code) {
  const sku = normalizeSku(code)
  if (category === "Remeras") {
    if (REMERA_TRAIL_NAMES[sku]) return REMERA_TRAIL_NAMES[sku]
    // Nombre comercial de planilla
    return titleCase(code)
  }
  if (SHORT_TRAIL_NAMES[sku]) return SHORT_TRAIL_NAMES[sku]
  return titleCase(code)
}

function titleCase(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])\S/g, (c) => c.toUpperCase())
}

function aggregate(category, rows) {
  /** @type {Map<string, { sku: string, name: string, category: string, price: number, variants: Map<string, Map<string, number>>, rowCount: number }>} */
  const products = new Map()

  for (const [code, color, size, price] of rows) {
    const sku = normalizeSku(code)
    const colorKey = String(color).trim().toUpperCase()
    const sizeKey = String(size).trim().toUpperCase()
    if (!products.has(sku)) {
      products.set(sku, {
        sku,
        name: displayName(category, code),
        category,
        price: Number(price),
        variants: new Map(),
        rowCount: 0,
      })
    }
    const p = products.get(sku)
    p.rowCount += 1
    if (Number(price) !== p.price) {
      // keep first price; flag later if mismatch
      p.priceMismatch = true
    }
    if (!p.variants.has(colorKey)) p.variants.set(colorKey, new Map())
    const sizes = p.variants.get(colorKey)
    sizes.set(sizeKey, (sizes.get(sizeKey) || 0) + 1)
  }

  return [...products.values()].sort((a, b) => a.sku.localeCompare(b.sku))
}

const shorts = aggregate("Shorts", raw.shorts)
const remeras = aggregate("Remeras", raw.remeras)
const all = [...shorts, ...remeras]

function productStock(p) {
  let n = 0
  for (const sizes of p.variants.values()) {
    for (const qty of sizes.values()) n += qty
  }
  return n
}

const lines = []
lines.push("# Catálogo Juli — revisión")
lines.push("")
lines.push("Generado desde planillas (foto 1 = Shorts, fotos 2–5 = Remeras).")
lines.push("Cada fila física = 1 unidad de stock. El SKU no se muestra en la tienda.")
lines.push("")
lines.push("**Revisá nombres trail; cuando esté OK, pedí cargar a la nube.**")
lines.push("")

function section(title, list) {
  lines.push(`## ${title}`)
  lines.push("")
  lines.push(`Productos: **${list.length}** · Unidades: **${list.reduce((s, p) => s + productStock(p), 0)}**`)
  lines.push("")
  for (const p of list) {
    lines.push(`### ${p.name}`)
    lines.push("")
    lines.push(`- SKU: \`${p.sku}\``)
    lines.push(`- Precio: $ ${p.price.toLocaleString("es-AR")}`)
    lines.push(`- Stock total: ${productStock(p)}`)
    if (p.priceMismatch) lines.push("- ⚠️ Había precios distintos en filas del mismo código; se usó el primero.")
    lines.push("")
    lines.push("| Color | Talle | Stock |")
    lines.push("| --- | --- | ---: |")
    for (const [color, sizes] of [...p.variants.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      for (const [size, qty] of [...sizes.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        lines.push(`| ${color} | ${size} | ${qty} |`)
      }
    }
    lines.push("")
  }
}

section("Shorts", shorts)
section("Remeras", remeras)

lines.push("## Resumen nombres trail (remeras con código)")
lines.push("")
lines.push("| SKU | Nombre propuesto |")
lines.push("| --- | --- |")
for (const [sku, name] of Object.entries(REMERA_TRAIL_NAMES).sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`| ${sku} | ${name} |`)
}
lines.push("")
lines.push("## Resumen nombres trail (shorts con código)")
lines.push("")
lines.push("| SKU | Nombre propuesto |")
lines.push("| --- | --- |")
for (const [sku, name] of Object.entries(SHORT_TRAIL_NAMES).sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`| ${sku} | ${name} |`)
}
lines.push("")

const docsDir = path.join(__dirname, "..", "docs")
fs.mkdirSync(docsDir, { recursive: true })
const mdPath = path.join(docsDir, "catalogo-juli-revision.md")
fs.writeFileSync(mdPath, lines.join("\n"))

const csvRows = ["categoria,sku,nombre,precio,color,talle,stock"]
for (const p of all) {
  for (const [color, sizes] of p.variants.entries()) {
    for (const [size, qty] of sizes.entries()) {
      csvRows.push(
        [p.category, p.sku, `"${p.name}"`, p.price, color, size, qty].join(",")
      )
    }
  }
}
const csvPath = path.join(docsDir, "catalogo-juli-revision.csv")
fs.writeFileSync(csvPath, csvRows.join("\n") + "\n")

// SQL idempotente por SKU
function esc(s) {
  return String(s).replace(/'/g, "''")
}

const sql = []
sql.push("-- Catálogo Juli: Shorts + Remeras (idempotente por SKU)")
sql.push("-- No incluye seed mock. Revisar docs/catalogo-juli-revision.md antes de aplicar.")
sql.push("BEGIN;")
sql.push("")
sql.push(`INSERT INTO categories (name, slug)
VALUES ('Shorts', 'shorts'), ('Remeras', 'remeras')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;`)
sql.push("")

for (const p of all) {
  sql.push(`-- ${p.sku} / ${p.name}`)
  sql.push(`INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT '${esc(p.name)}', '${esc(p.sku)}', NULL, ${p.price}, c.id, 0, false
FROM categories c
WHERE c.slug = '${p.category === "Shorts" ? "shorts" : "remeras"}'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '${esc(p.sku)}');`)
  sql.push(`UPDATE products SET name = '${esc(p.name)}', price = ${p.price},
  category_id = (SELECT id FROM categories WHERE slug = '${p.category === "Shorts" ? "shorts" : "remeras"}')
WHERE sku = '${esc(p.sku)}';`)
  sql.push("")

  for (const [color, sizes] of p.variants.entries()) {
    sql.push(`INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, '${esc(color)}', 0 FROM products p
WHERE p.sku = '${esc(p.sku)}'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = '${esc(color)}'
  );`)
    for (const [size, qty] of sizes.entries()) {
      sql.push(`INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, '${esc(size)}', ${qty}
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '${esc(p.sku)}' AND v.color = '${esc(color)}'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;`)
    }
    sql.push(`UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '${esc(p.sku)}' AND v.color = '${esc(color)}';`)
  }
  sql.push(`UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '${esc(p.sku)}';`)
  sql.push("")
}

sql.push("COMMIT;")

const sqlPath = path.join(docsDir, "catalogo-juli-load.sql")
fs.writeFileSync(sqlPath, sql.join("\n"))

const summary = {
  shortsProducts: shorts.length,
  shortsUnits: shorts.reduce((s, p) => s + productStock(p), 0),
  remerasProducts: remeras.length,
  remerasUnits: remeras.reduce((s, p) => s + productStock(p), 0),
  mdPath,
  csvPath,
  sqlPath,
}
console.log(JSON.stringify(summary, null, 2))
