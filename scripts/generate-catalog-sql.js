/**
 * Generates scripts/028_seed_catalog.sql from the catalog paste.
 * Run: node scripts/generate-catalog-sql.js
 */
const fs = require("fs");
const path = require("path");

const raw = `PRODUCTO	CODIGO	TALLES	COLORES	CANTIDAD	PRECIO
REMERAS MANGAS CORTAS					
Remeras Mangas cortas Britny	RC1	M	Blanco	1	$20.400
Remeras Mangas cortas cuello fluor	RC2	U	Blanco	3	$45.600
Remeron Stampa Tigre y Flor	RC3	U	Blanco	3	$42.200
Remera manga globo brodery	RC4	U	Blanco	1	$28.600
Remera manga calada flores	RC5	U	Blanco	2	$29.700
Remera NEW YORK CITY	RC6	U	Blanco	1	$28.500
Remeron MERYL STREEP	RC7	U	Blanco	1	$22.500
Remera mangas Volados con apliques	RC8	U	Blanco	1	$35.600
Remera TIGRE SIDDARTA	RC9	U	Blanco	1	
Remera MONACO SIDDARTA	RC10	U	Blanco	1	$22.500
Remera MANGAS VUELOS BRODERI	RC11	U	Blanco	1	$28.600
Remera Marilyn Vete al Diablo	RC12	S	Blanco	1	$32.000
Remeron Oasis 	RC13	U	Blanco	1	$20.500
Remera Tigre FEANLESS	RC14	U	Blanco	1	$19.800
Remera WOMEN CIGARRO	RC15	U	Negra	1	$22.500
Remera Tigre FEANLESS	RC16	U	Negra	1	$19.800
Remera LAZO EN EL CUELLO	RC17	U	Negra	1	$15.600
Remera cuello V tachas doradas	RC18	U	Negra	1	$22.000
Remera detalle Hombros HOJAS DORADAS	RC19	U	Negra	1	$25.300
Remera NEW YORK SIDDHARTA 	RC20	U	negra	1	$22.500
Remera detalle cuello STRAS	RC21	U	Negra	1	$28.000
Remera basica THE REGULAR	RC22	U	Negra	1	$19.300
Remera OSAIANA MANGAS PRINCESA	RC23	U	Negra	1	$18.000
Remera MORLEY LES CLASSIQUES 	RC24	U	Negra	1	$24.000
Remera BERVELY  HILLS SIDDHARTA	RC25	U	Negra	1	$22.500
Remeron My BITCH 	RC26	U	Batick	1	
Remeron YOU ARE	RC27	U	Batick	1	$21.600
Remeron FLORIDA	RC28	U	Batick	1	$18.400
Remeron LOVE	RC29	U	Batick	1	$21.600
Remeron ROCK 	RC30	U	Batick	1	$21.600
Remera cuello V detalle MANGAS STRAS	RC31	U	Bordo	1	$22.000
Remera FEED TIGER	RC32	U	Amarillo	1	$33.800
Remera detalle MANGAS FLORES LENT.	RC33	U	Amarillo	1	$28.700
Remera cuello V 	RC34	U	Verde militar	1	$17.500
Remera mangas caladas flores mangas	RC35	U	Gris claro 	1	$28.700
Remera Morley manfas princesa	RC36	U	Gris claro 	1	$15.000
Remera DETALLE CUELLO 	RC37	M	Blanco	1	$25.000
Remera DETALLE cuello stras	RC38	M	Negra	1	$25.000
CAMISAS					
Camisa CELIA cuello Mao	CAM01	M 	Blanca	1	$35.800
Camisa CELIA cuello Mao	CAM01	L	Blanca	1	$35.800
Camisa RAYADA Over 	CAM02	M	Beige	1	$32.400
Camisa JULIA con recorte en cintura	CAM03	U	Natural	1	$43.700
Camisa ANA detalle cuello mao y lazo	CAM04	U	Natural	1	$47.200
Camisa animal PRINT GASA	CAM05	U	Animal print	1	$32.0000
Camisa CECY detalle botones brillo	CAM06	M	Aqua marina	1	$28.800
Camisa LOUISA cuello mao gasa	CAM07	M	Negra	1	$55.500
Camisa PIA lino detalle broderi busto	CAM08	M	Nergra	1	$45.000
Camisa LALY tipo seda	CAM09	M	Negra	1	$21.000
Camisa LIA BRODERI	CAM10	S	Negra	1	$31.800
MUSCULOSAS de VESTIR					
Musculosa vete al diablo lisa	MUS01	S	Blanca	1	$28.000
Musculosa stampa chica detakke broderi	MUS02	U	Blanca	1	$32.000
Musculosa IBIZA cuello rosa 	MUS03	U	Blanca 	1	$26.500
Musculosa tipo sudadera MERYL STREEP	MUS04	U	Blanca	1	$16.000
Musculosa BRODERI cuello volados	MUS05	U	Natural	1	$23.000
Musculosa BRODERI detalle espalda lazo	MUS06	U	Natural	1	$23.000
Musculosa BRODERI recorte en la cintura	MUS07	M	Blanca	1	$28.900
Musculosa TACHAS	MUS08	U	Chocolate	1	$22.500
Musculosa CEY detalle vuelo hombros	MUS09	U	Chocolate	1	$20.000
Musculosa BAMBULA vuelos 	MUS10	U	Natural	1	$28.600
Muculosa lino VAQUITA	MUS11	U	Beige	1	$20.400
Musculosa CEBRA	MUS12	U	Negro y blanco	1	$18.600
Musculosa MORLEY escote americano	MUS13	S	Negra	1	$18.000
Musculosa Hilo rayada 	MUS14	U	Negra y Blanca	1	$12.000
Musculosa BRODERI detalle espalda lazo	MUS15	U	Negra 	1	$23.000
Musculosa BRODERI cuello volados	MUS16	U	Negra 	1	$23.000
Musculosa BAMBULA detalle puntillas	MUS17	U	Negra	1	$32.200
Musculosa Bambula TIRITAS DOBLE	MUS18	U	Negra	1	$23.600
Muculosa STAMPA FLORES	MUS19	U	Negra	1	$16.000
Musculosa TACHAS HOMBROS	MUS20	U	Negra 	1	$21.600
Muaculosa MORLEY ESCOTE AMERICANO	MUS21	S	Blanco	1	$18.000
CHALECOS Y REMERAS TEJIDAS					
Saquito mangas cortas lazo	SAC01	U	Blanco 	1	$15.000
Chaleco tejido LOLA 	CHA01	M	Natural	1	$41.800
Chaleco FLORES bordadas	CHA02	U	Arena	1	$27.500
Chaleco TINA BAMBILA LAZOS 	CHA03	U	Natural	1	$28.900
Remeron MARIPOSA tejido 	REMT01	U	Natural	1	$18.600
Chaleco LUNA TEJIDO Y FLECOS	CHA04	U	Natural	1	$38.200
Remera Tejida Vuelo mangas	REMT02	U	Natural	1	$24.500
Remera CALADA  OLGA BOTONES	REMT03	M	Natural	1	$48.000
Chaleco OLI DE LUCCA	CHA05	M	Ntural a rayas N.	1	$58.000
Chaleco MILI	CHA06	M	Natural	1	$25.500
Chaleco YI Sastrero	CHA07	M	Camel	1	$26.000
Chaleco Bordado MERY	CHA08	L	Natural	1	$29.300
Chaleco Bordado MERY	CHA09	M	Negro	1	$29.300
Chaleco  negro Bordado Canutillos	CHA10	M/L	Negro	1	$48.0000
Chaleco DEMIN bordado 	CHA11	M/L	Celestes jeans	1	$42.000
Chaleco LINO BORDADO CANUTILLOS	CHA12	M	Blanco	1	$59.400
Saquito mangas cortas lazo	SAC02	U	Negro	1	$15.000
Chaleco Largo tejido 	CHA13	U	Bige	1	$34.700
Chaleco Largo tejido 	CHA14	U	Blanco	1	$34.700
BODYS					
Body animal PRINT ESC. AMERICANO	BOD01	U	Animal print	1	$30.000
Body PAULA espalda transparente	BOD02	U	Negro	1	$30.000
Body ROMA detalle aplique busto	BOD03	U 	Negro 	1	$28.800
Body ROMA detalle aplique busto	BOD04	U	Chocolate	1	$28.800
Body MORLEY mangas cortas animal print	BOD05	U	Blanco y negro 	1	$23.100
SOLERAS NOCHE					
Solera FOIL LAZO ESPALDA	SOL01	U	Gris plata 	1	$33.300
Solera FLOR esc. Americano y lazo 	SOL02	U	Celeste y strass	1	$34.000
Solerita JO BAMBULA esc. Cuadrado	SOL03	U	Celeste	1	$26.000
Solera Hombreras 	SOL04	U	Beige	1	$29.600
Solera frunce laterales aplique derecho.	SOL05	U	Beige	1	$18.000
Solera MORLEY TIRITAS RATON 	SOL06	U	Beige	1	$18.500
Solera LENCERA puntilla espalda	SOL07	U	Beige	1	$25.500
Solera amplia detalle FOIL	SOL08	U	Chocolate	1	$21.000
Solera amplia detalle FOIL	SOL09	U	Natural	1	$21.000
Solera LENTEJUELAS HOMBROS	SOL10	U	Beige	1	$21.000
Solera amplia CAROLA STRAS BUSTO	SOL11	U	Chocolate	1	$32.400
Solera Lencera corte irregular y puntilla	SOL12	U	Chocolate	1	$32.200
Solera Lencera bretel regulable y puntilla	SOL13	U	Ñude	1	$38.300
Solera ANIMAL Print HOBRERAS	SOL14	U	Animal print	1	$25.500
Solera de gasa destellos dorados 	SOL15	U	Bige y marron	1	$28.200
Solera Crop top animal print	SOL16	U	Animal print	1	$23.200
Solera FLOR esc. Americano y lazo 	SOL17	U	Amarillo	1	$34.000
Solera Bretel STRAS	SOL18	U	Amarillo	1	$21.500
Solera MORLEY TIRITAS RATON 	SOL19	U	Amarillo	1	$18.500
Solera frunce lateral izq y frunce hombro 	SOL20	U	Blanco	1	$16.800
Solera BRETEL RASO 	SOL21	U	Blanco	1	$15.800
Solera Betel COLITA DE RATA 	SOL22	U	Blanco	1	$19.500
Solera Tachas y Brillo 	SOL23	U	Blanco	1	$41.600
Solera lencera FOIL Y PUNTILLA	SOL24	U	Gris plata 	1	$26.500
Solera BRETEL STRAS	SOL25	U	Blanco 	1	$21.500
Solera RED STRAS 	SOL26	U	Negra 	1	$21.000
Solera CUELLO BUCHE aplique hombro	SOL27	U	Negra	1	$16.200
Solera BORDADO CANUTILLOS 	SOL28	U	Negra	1	$45.500
Solera Lencera corte irregular y puntilla	SOL29	U	Negra	1	$32.200
Solera BRETEL STRAS	SOL30	U	Negra	1	$21.500
Solera Lencera ESPALDA PUNTILLA	SOL31	U	Negra	1	$25.500
Solera Lencera RASO ESTRELLAS Y PUNTILLAS	SOL32	U	Negra	1	$20.000
Solera CROP TOP STRAS	SOL33	U	Negra	1	$28.000
Solera Bretel RASO 	SOL34	U	Negra	1	$15.800
Solera BRETEL COLITA DE RATON 	SOL35	U	Negra	1	$19.500
Solera ABOTONADA espelada 	SOL36	U	Negra	1	$28.000
Solera TOP LAZO ESPALDA 	SOL37	U	Negra	1	$27.500
Solera Bretel STRAS	SOL38	U	ROSA	1	21.5
Solera FOIL LAZO ESPALDA	SOL39	U	Negra	1	$33.300
Solera de algodón HOMBROS STRAS	SOL40	U	Negra	1	$22.400
Solera cuello y frente STRAS Y PIEDRAS	SOL41	U	Negra	1	$31.200
Solera DETTALLE HOMBROS LENTEJUELAS	SOL42	U	Negra	1	$21.000
Solera ENGOMADA FRENTE Y ESPALDA TULL	SOL43	U	Negra	2	$21.000
Solera TOP ESPALDA CRUZADA 	SOL44	U	Negra	1	$25.000
Solera FOIL MANGAS CORTAS	SOL45	U	GRIS	1	$28.000
Solera SOLO HOMBRO Y CADENAS COLGANTES	SOL46	S	Negra 	1	$42.500
VESTIDOS LARGOS Y CORTOS					
Vestido MAIA LISO Bretel regulable	VES01	U	Chocolate	1	$46.200
Vestido Nube bretel ancho	VES02	U	Celeste y azul	1	$46.700
Vestido FLORES, VUELO BUSTO	VES03	U	Gama marrones	1	$48.000
Vestido FLORES, VUELO BUSTO	VES04	U	Gama celestes	1	$48.000
Vestido mangas cortas detalle PUNTILLA	VES05	U	Negro	1	$44.800
Vestido corto BAMBULA VICTORIA	VES06	U	Negro	1	$31.900
Vestido HINDU mangas cortas y frunce 	VES07	U	Negro y dorado	1	
Vestido HINDU s/mangas y frunce	VES08	U	Negro y dorado 	1	
Vestido ANIMAL PRINT Y PUNTILLAS 	VES09	U	Animal print	1	$61.000
Vestido Tipo Lencero 	VES10	M	Negro-chocolate-beige	4	$46.000
POLLERAS LARGAS Y CORTAS					
Pollera larga ANTONIA LISA	FAL01	U	Negra	1	$47.500
Pollera larga ANTONIA LISA	FAL02	U	Beige	1	$47.500
Pollera larga ANTONIA PRINT	FAL03	U	Animal print	1	$47.500
Pollera Larga ANTONIA LEOPARDO	FAL04	U	Leopardo	2	$47.500
Pollera Larga SARA VUELO ABAJO	FAL05	U	Marron	2	$43.900
Pollera Larga Demin vuelo 	FAL06	U	Celeste	1	$47.500
Mini stampada sastrera 	FAL07	2	Estampada	1	$33.400
Pollera LARGA Plisada MIDI	FAL08	S,L	Negra	2	$55.000
Mni tachas y bolsillo engomada	FAL09		NEGRA		$38.500
Mini abotonada adelante engomada	FAL10		NEGRA		$36.000
Mini TACHAS LISA	FAL11	U	NEGRA	1	$38.000
Pollera LINO Y VUELOS 	FAL12	M	NEGRA	1	$28.800
Pollera LINO Y VUELOS 	FAL13	M	ARENA	1	$28.800
Pollera LENTEJUELAS 	FAL14	U	NEGRA Y DORADA	1	$45.600
Pollera VUELO ANIMAL PRINT	FAL15	U	Animal print	1	$20.700
Pollera BAMBULA LAMBADA	FAL16	U	Blanca	1	$31.200
Pollera FRUNSE ENGOMADA 	FAL17	U	Negra y chocolate	2	$28.600
Pollera Pantalon lino con detalle hebilla 	FAL18	2	Natural	1	$29.700
Pollera Pantalon lino con detalle hebilla 	FAL19	3	Arena	1	$29.700
Pollera pantalon Vengalina con tachas 	FAL20	M	Negra	1	$21.000
SHORTS 					
Short lino a rayas verticales	SHOR01	M	Rayas Celeste 	1	$23.000
Short lino a rayas verticales	SHOR02	M	Rayas chocolate	1	$23.000
Short Broderi volado	SHOR03	M	Blanco	1	$26.500
Short Broderi volado	SHOR04	M	Beige	1	$26.500
Bemuda Sastrera 	BERMU01	M	Negra	1	$10.000
Short con vuelos de lino	SHOR05	U	Negra	1	$32.400
Short Cey elastico cintura	SHOR06	M	Celeste	1	$23.000
Short tipo sastrera DE GAZA	SHORT07	M	Negra	1	$25.800
Short lino bolsillos cuadrado y lazo	SHOR08	M	Negra	1	$28.800
Short Morley detalle dorados	SHORT09	M	Chocolate	1	$16.500
Short Morley detalle dorados	SHOR10	L	Natural	1	$16.500
Short Run lino y tiritas	SHOR11	L	Beige	1	$30.000
Short Run lino y tiritas	SHOR12	M	Beige	1	$30.000
Short Run lino y tiritas	SHOR13	L	Negro	1	$30.000
Shor tejido 	SHOR14	M	Natural	1	$26.000
Short Sastreri lino	SHOR15	M	Arena	1	$36.800
Short Deflecado	SHOR16	38-44	Negro	2	$36.800
Short Deflecado	SHOR17	36-38-40-42	Azul	4	$36.800
Short Cargo	SHOR18	40-42	Celeste	2	$26.000
Short Rroturas y pinzas	SHOR19	44	Azul	1	$26.000
Short  DEFLECADO	SHOR20	38-40-42	Celeste	3	$36.800
Bermuda Sin Ruedo	BERMU02		NEGRA		$39.300
Bermuda Sin Ruedo	BERMU03		GRIS		$39.300
Bermuda Sin Ruedo	BERMU04		BLANCA		$39.300
CAMPERAS Y BLAZER					
Campera de jeans	CAM01	OVERZIDE	GRIS	1	$46.000
Camisaco	CAM02	M	GRIS	1	$44.000
Campera de jeans	CAM03	OVERZIDE	Animal Print	1	$48.000
Blazer sin bolsollos	BLA01	M	GRIS	1	$32.500`;

function slug(s) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parsePrice(p) {
  if (!p || !String(p).trim()) return 0;
  const s = String(p).trim().replace(/\$/g, "").replace(/,/g, ".").trim();
  if (!s) return 0;
  const num = parseFloat(s);
  if (isNaN(num)) return 0;
  if (num < 100 && num > 0 && !s.includes(".")) return num * 1000;
  if (num > 0 && num < 1000 && s.split(".")[0].length <= 2) return Math.round(num * 1000);
  return Math.round(num);
}

const escape = (s) => String(s).replace(/'/g, "''");

const lines = raw.split("\n").map((l) => l.split("\t"));
const categories = [];
const rows = [];
let currentCat = null;
let currentSlug = null;

for (let i = 1; i < lines.length; i++) {
  const [producto, codigo, talles, colores, cantidad, precio] = lines[i].map((s) => (s || "").trim());
  if (!producto) continue;
  const isCategoryHeader =
    !codigo && !talles && !colores && !cantidad && !precio;
  if (isCategoryHeader) {
    currentCat = producto;
    currentSlug = slug(producto);
    categories.push({ name: currentCat, slug: currentSlug });
    continue;
  }
  if (!currentCat || !currentSlug) continue;
  const size = (talles || "U").trim() || "U";
  const color = (colores || "Sin especificar").trim();
  const qty = Math.max(1, parseInt(cantidad, 10) || 1);
  const price = parsePrice(precio);
  rows.push({
    cat_slug: currentSlug,
    name: producto,
    size,
    color,
    qty,
    price,
  });
}

const out = [];
out.push("-- Catálogo Atto: categorías, productos, variantes (color) y talles (stock).");
out.push("-- Ejecutar después de 027_clean_products_and_orders.sql");
out.push("");

out.push("-- 1. Categorías (ON CONFLICT DO NOTHING si ya existen)");
for (const c of categories) {
  out.push(
    `INSERT INTO categories (name, slug) VALUES ('${escape(c.name)}', '${escape(c.slug)}') ON CONFLICT (slug) DO NOTHING;`
  );
}
out.push("");

out.push("-- 2. Tabla temporal con cada fila del catálogo");
out.push("CREATE TEMP TABLE IF NOT EXISTS _catalog (cat_slug TEXT, pname TEXT, color TEXT, size TEXT, qty INT, price NUMERIC(10,2));");
out.push("TRUNCATE _catalog;");
out.push("INSERT INTO _catalog (cat_slug, pname, color, size, qty, price) VALUES");
const values = rows.map(
  (r) =>
    `('${escape(r.cat_slug)}', '${escape(r.name)}', '${escape(r.color)}', '${escape(r.size)}', ${r.qty}, ${r.price})`
);
out.push("  " + values.join(",\n  ") + ";");
out.push("");

out.push("-- 3. Por cada fila: obtener/crear producto, variante (color), talle (stock)");
out.push("DO $$");
out.push("DECLARE");
out.push("  c_id UUID;");
out.push("  p_id UUID;");
out.push("  v_id UUID;");
out.push("  r RECORD;");
out.push("BEGIN");
out.push("  FOR r IN SELECT * FROM _catalog");
out.push("  LOOP");
out.push("    SELECT id INTO c_id FROM categories WHERE slug = r.cat_slug LIMIT 1;");
out.push("    IF c_id IS NULL THEN RAISE NOTICE 'Categoría no encontrada: %', r.cat_slug; CONTINUE; END IF;");
out.push("    SELECT id INTO p_id FROM products WHERE name = r.pname AND category_id = c_id LIMIT 1;");
out.push("    IF p_id IS NULL THEN");
out.push("      INSERT INTO products (name, category_id, price, stock) VALUES (r.pname, c_id, r.price, 0) RETURNING id INTO p_id;");
out.push("    END IF;");
out.push("    INSERT INTO product_variants (product_id, color, stock) VALUES (p_id, r.color, 0)");
out.push("      ON CONFLICT (product_id, color) DO NOTHING;");
out.push("    SELECT id INTO v_id FROM product_variants WHERE product_id = p_id AND color = r.color LIMIT 1;");
out.push("    INSERT INTO product_variant_sizes (variant_id, size, stock) VALUES (v_id, r.size, r.qty)");
out.push("      ON CONFLICT (variant_id, size) DO UPDATE SET stock = product_variant_sizes.stock + EXCLUDED.stock;");
out.push("  END LOOP;");
out.push("END $$;");
out.push("");

const sqlPath = path.join(__dirname, "028_seed_catalog.sql");
fs.writeFileSync(sqlPath, out.join("\n"), "utf8");
console.log("Written", sqlPath);
console.log("Categories:", categories.length);
console.log("Rows:", rows.length);
