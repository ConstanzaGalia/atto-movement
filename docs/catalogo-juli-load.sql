-- Catálogo Juli: Shorts + Remeras (idempotente por SKU)
-- No incluye seed mock. Revisar docs/catalogo-juli-revision.md antes de aplicar.
BEGIN;

INSERT INTO categories (name, slug)
VALUES ('Shorts', 'shorts'), ('Remeras', 'remeras')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 12961S26 / Short filo
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Short filo', '12961S26', NULL, 44900, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '12961S26');
UPDATE products SET name = 'Short filo', price = 44900,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = '12961S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'CHOCOLATE', 0 FROM products p
WHERE p.sku = '12961S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'CHOCOLATE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '12961S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '12961S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '12961S26' AND v.color = 'CHOCOLATE';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '12961S26';

-- 12962S26 / Short abra
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Short abra', '12962S26', NULL, 42000, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '12962S26');
UPDATE products SET name = 'Short abra', price = 42000,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = '12962S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS OSCURO', 0 FROM products p
WHERE p.sku = '12962S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS OSCURO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '12962S26' AND v.color = 'GRIS OSCURO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '12962S26' AND v.color = 'GRIS OSCURO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'TURQUESA', 0 FROM products p
WHERE p.sku = '12962S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'TURQUESA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '12962S26' AND v.color = 'TURQUESA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '12962S26' AND v.color = 'TURQUESA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '12962S26';

-- 13024S26 / Short travesía
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Short travesía', '13024S26', NULL, 44000, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '13024S26');
UPDATE products SET name = 'Short travesía', price = 44000,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = '13024S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'CHOCOLATE', 0 FROM products p
WHERE p.sku = '13024S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'CHOCOLATE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 2
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '13024S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '13024S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '13024S26' AND v.color = 'CHOCOLATE';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BEIGE', 0 FROM products p
WHERE p.sku = '13024S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BEIGE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '13024S26' AND v.color = 'BEIGE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '13024S26' AND v.color = 'BEIGE';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'VERDE FLUO', 0 FROM products p
WHERE p.sku = '13024S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'VERDE FLUO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 2
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '13024S26' AND v.color = 'VERDE FLUO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '13024S26' AND v.color = 'VERDE FLUO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '13024S26' AND v.color = 'VERDE FLUO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '13024S26';

-- BOLSI / Bolsi
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Bolsi', 'BOLSI', NULL, 54900, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'BOLSI');
UPDATE products SET name = 'Bolsi', price = 54900,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = 'BOLSI';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'ROJO', 0 FROM products p
WHERE p.sku = 'BOLSI'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'ROJO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'BOLSI' AND v.color = 'ROJO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'BOLSI' AND v.color = 'ROJO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'BOLSI';

-- CINTO-2 / Cinto 2
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Cinto 2', 'CINTO-2', NULL, 58700, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'CINTO-2');
UPDATE products SET name = 'Cinto 2', price = 58700,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = 'CINTO-2';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS', 0 FROM products p
WHERE p.sku = 'CINTO-2'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'CINTO-2' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'CINTO-2' AND v.color = 'GRIS';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'CINTO-2';

-- DRY / Dry
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Dry', 'DRY', NULL, 45500, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'DRY');
UPDATE products SET name = 'Dry', price = 45500,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = 'DRY';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS CLARO', 0 FROM products p
WHERE p.sku = 'DRY'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS CLARO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'DRY' AND v.color = 'GRIS CLARO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'DRY' AND v.color = 'GRIS CLARO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCO', 0 FROM products p
WHERE p.sku = 'DRY'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'DRY' AND v.color = 'BLANCO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'DRY' AND v.color = 'BLANCO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRO', 0 FROM products p
WHERE p.sku = 'DRY'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'DRY' AND v.color = 'NEGRO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'DRY' AND v.color = 'NEGRO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'DRY';

-- FIRU / Firu
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Firu', 'FIRU', NULL, 51900, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'FIRU');
UPDATE products SET name = 'Firu', price = 51900,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = 'FIRU';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'MORADO', 0 FROM products p
WHERE p.sku = 'FIRU'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'MORADO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'FIRU' AND v.color = 'MORADO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'FIRU' AND v.color = 'MORADO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'FIRU';

-- FLUO / Fluo
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Fluo', 'FLUO', NULL, 42000, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'FLUO');
UPDATE products SET name = 'Fluo', price = 42000,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = 'FLUO';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NARANJA', 0 FROM products p
WHERE p.sku = 'FLUO'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NARANJA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'FLUO' AND v.color = 'NARANJA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'FLUO' AND v.color = 'NARANJA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'FLUO';

-- MARATON / Maraton
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Maraton', 'MARATON', NULL, 41000, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'MARATON');
UPDATE products SET name = 'Maraton', price = 41000,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = 'MARATON';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRO', 0 FROM products p
WHERE p.sku = 'MARATON'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'MARATON' AND v.color = 'NEGRO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'MARATON' AND v.color = 'NEGRO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'VERDE PETROLEO', 0 FROM products p
WHERE p.sku = 'MARATON'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'VERDE PETROLEO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'MARATON' AND v.color = 'VERDE PETROLEO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'MARATON' AND v.color = 'VERDE PETROLEO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'MARATON';

-- PLISA / Plisa
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Plisa', 'PLISA', NULL, 43000, c.id, 0, false
FROM categories c
WHERE c.slug = 'shorts'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'PLISA');
UPDATE products SET name = 'Plisa', price = 43000,
  category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE sku = 'PLISA';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NARANJA', 0 FROM products p
WHERE p.sku = 'PLISA'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NARANJA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'PLISA' AND v.color = 'NARANJA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'PLISA' AND v.color = 'NARANJA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'PLISA';

-- 4051S26 / Remera aconquija
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera aconquija', '4051S26', NULL, 32000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '4051S26');
UPDATE products SET name = 'Remera aconquija', price = 32000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '4051S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '4051S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4051S26' AND v.color = 'NEGRA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '4051S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4051S26' AND v.color = 'BLANCA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'VERDE', 0 FROM products p
WHERE p.sku = '4051S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'VERDE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'VERDE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'VERDE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4051S26' AND v.color = 'VERDE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4051S26' AND v.color = 'VERDE';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '4051S26';

-- 4052S26 / Remera ñuñorco
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera ñuñorco', '4052S26', NULL, 28000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '4052S26');
UPDATE products SET name = 'Remera ñuñorco', price = 28000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '4052S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'CELESTE', 0 FROM products p
WHERE p.sku = '4052S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'CELESTE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4052S26' AND v.color = 'CELESTE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4052S26' AND v.color = 'CELESTE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4052S26' AND v.color = 'CELESTE';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '4052S26';

-- 4055S26 / Remera muñoz
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera muñoz', '4055S26', NULL, 32000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '4055S26');
UPDATE products SET name = 'Remera muñoz', price = 32000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '4055S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCO', 0 FROM products p
WHERE p.sku = '4055S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4055S26' AND v.color = 'BLANCO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4055S26' AND v.color = 'BLANCO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4055S26' AND v.color = 'BLANCO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4055S26' AND v.color = 'BLANCO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRO', 0 FROM products p
WHERE p.sku = '4055S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4055S26' AND v.color = 'NEGRO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4055S26' AND v.color = 'NEGRO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4055S26' AND v.color = 'NEGRO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '4055S26';

-- 4056S26 / Remera pelao
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera pelao', '4056S26', NULL, 30000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '4056S26');
UPDATE products SET name = 'Remera pelao', price = 30000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '4056S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRO', 0 FROM products p
WHERE p.sku = '4056S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4056S26' AND v.color = 'NEGRO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4056S26' AND v.color = 'NEGRO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCO', 0 FROM products p
WHERE p.sku = '4056S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4056S26' AND v.color = 'BLANCO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4056S26' AND v.color = 'BLANCO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4056S26' AND v.color = 'BLANCO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '4056S26';

-- 4057S26 / Remera negrito
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera negrito', '4057S26', NULL, 32000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '4057S26');
UPDATE products SET name = 'Remera negrito', price = 32000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '4057S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'MANCHAS', 0 FROM products p
WHERE p.sku = '4057S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'MANCHAS'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4057S26' AND v.color = 'MANCHAS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4057S26' AND v.color = 'MANCHAS';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '4057S26';

-- 4062S26 / Remera tafí
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera tafí', '4062S26', NULL, 28000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '4062S26');
UPDATE products SET name = 'Remera tafí', price = 28000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '4062S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'ROJA', 0 FROM products p
WHERE p.sku = '4062S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'ROJA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4062S26' AND v.color = 'ROJA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4062S26' AND v.color = 'ROJA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4062S26' AND v.color = 'ROJA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'CELESTE', 0 FROM products p
WHERE p.sku = '4062S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'CELESTE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4062S26' AND v.color = 'CELESTE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4062S26' AND v.color = 'CELESTE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4062S26' AND v.color = 'CELESTE';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '4062S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4062S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4062S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4062S26' AND v.color = 'BLANCA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '4062S26';

-- 4066S26 / Remera el bolsón
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera el bolsón', '4066S26', NULL, 34000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '4066S26');
UPDATE products SET name = 'Remera el bolsón', price = 34000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '4066S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '4066S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4066S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4066S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4066S26' AND v.color = 'NEGRA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '4066S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '4066S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '4066S26' AND v.color = 'BLANCA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '4066S26';

-- 8360S26 / Remera infiernillo
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera infiernillo', '8360S26', NULL, 44000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8360S26');
UPDATE products SET name = 'Remera infiernillo', price = 44000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8360S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '8360S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8360S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8360S26' AND v.color = 'BLANCA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8360S26';

-- 8369S26 / Remera mala mala
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera mala mala', '8369S26', NULL, 36500, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8369S26');
UPDATE products SET name = 'Remera mala mala', price = 36500,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8369S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '8369S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8369S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8369S26' AND v.color = 'NEGRA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '8369S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8369S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8369S26' AND v.color = 'BLANCA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8369S26';

-- 8371S26 / Remera la ciénaga
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera la ciénaga', '8371S26', NULL, 34000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8371S26');
UPDATE products SET name = 'Remera la ciénaga', price = 34000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8371S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'CELESTE', 0 FROM products p
WHERE p.sku = '8371S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'CELESTE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8371S26' AND v.color = 'CELESTE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8371S26' AND v.color = 'CELESTE';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'CHOCOLATE', 0 FROM products p
WHERE p.sku = '8371S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'CHOCOLATE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8371S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8371S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8371S26' AND v.color = 'CHOCOLATE';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8371S26';

-- 8383S26 / Remera raco
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera raco', '8383S26', NULL, 39900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8383S26');
UPDATE products SET name = 'Remera raco', price = 39900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8383S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'VIOLETA', 0 FROM products p
WHERE p.sku = '8383S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'VIOLETA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8383S26' AND v.color = 'VIOLETA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8383S26' AND v.color = 'VIOLETA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8383S26' AND v.color = 'VIOLETA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8383S26';

-- 8386S26 / Remera san javier
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera san javier', '8386S26', NULL, 41900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8386S26');
UPDATE products SET name = 'Remera san javier', price = 41900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8386S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'AZUL OSCURO', 0 FROM products p
WHERE p.sku = '8386S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'AZUL OSCURO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8386S26' AND v.color = 'AZUL OSCURO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8386S26' AND v.color = 'AZUL OSCURO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8386S26';

-- 8387S26 / Remera anfama
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera anfama', '8387S26', NULL, 38000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8387S26');
UPDATE products SET name = 'Remera anfama', price = 38000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8387S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '8387S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8387S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8387S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8387S26' AND v.color = 'NEGRA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8387S26';

-- 8405S26 / Remera siambón
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera siambón', '8405S26', NULL, 41000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8405S26');
UPDATE products SET name = 'Remera siambón', price = 41000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8405S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '8405S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8405S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8405S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8405S26' AND v.color = 'BLANCA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8405S26';

-- 8406S26 / Remera potrerillo
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera potrerillo', '8406S26', NULL, 34500, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8406S26');
UPDATE products SET name = 'Remera potrerillo', price = 34500,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8406S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '8406S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8406S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8406S26' AND v.color = 'BLANCA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8406S26';

-- 8407S26 / Remera ampimpa
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera ampimpa', '8407S26', NULL, 36900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8407S26');
UPDATE products SET name = 'Remera ampimpa', price = 36900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8407S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'CHOCOLATE', 0 FROM products p
WHERE p.sku = '8407S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'CHOCOLATE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8407S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8407S26' AND v.color = 'CHOCOLATE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8407S26' AND v.color = 'CHOCOLATE';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8407S26';

-- 8408S26 / Remera amaicha
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera amaicha', '8408S26', NULL, 36900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8408S26');
UPDATE products SET name = 'Remera amaicha', price = 36900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8408S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS', 0 FROM products p
WHERE p.sku = '8408S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8408S26' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8408S26' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8408S26' AND v.color = 'GRIS';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '8408S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8408S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8408S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8408S26' AND v.color = 'BLANCA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8408S26';

-- 8415S26 / Remera lara
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera lara', '8415S26', NULL, 29000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8415S26');
UPDATE products SET name = 'Remera lara', price = 29000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8415S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'ROSA PALIDO', 0 FROM products p
WHERE p.sku = '8415S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'ROSA PALIDO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8415S26' AND v.color = 'ROSA PALIDO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8415S26' AND v.color = 'ROSA PALIDO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8415S26';

-- 8418S26 / Remera yerba buena
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera yerba buena', '8418S26', NULL, 39900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8418S26');
UPDATE products SET name = 'Remera yerba buena', price = 39900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8418S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'MAGENTA', 0 FROM products p
WHERE p.sku = '8418S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'MAGENTA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8418S26' AND v.color = 'MAGENTA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8418S26' AND v.color = 'MAGENTA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8418S26';

-- 8421S26 / Remera villa nougués
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera villa nougués', '8421S26', NULL, 31900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8421S26');
UPDATE products SET name = 'Remera villa nougués', price = 31900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8421S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '8421S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8421S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8421S26' AND v.color = 'NEGRA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS', 0 FROM products p
WHERE p.sku = '8421S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8421S26' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8421S26' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8421S26' AND v.color = 'GRIS';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8421S26';

-- 8427S26 / Remera apacheta
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera apacheta', '8427S26', NULL, 39900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8427S26');
UPDATE products SET name = 'Remera apacheta', price = 39900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8427S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BYN', 0 FROM products p
WHERE p.sku = '8427S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BYN'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8427S26' AND v.color = 'BYN'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8427S26' AND v.color = 'BYN';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8427S26';

-- 8428S26 / Remera abra
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera abra', '8428S26', NULL, 39900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8428S26');
UPDATE products SET name = 'Remera abra', price = 39900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8428S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'VERDE ESTAMPADA', 0 FROM products p
WHERE p.sku = '8428S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'VERDE ESTAMPADA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8428S26' AND v.color = 'VERDE ESTAMPADA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8428S26' AND v.color = 'VERDE ESTAMPADA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8428S26' AND v.color = 'VERDE ESTAMPADA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8428S26';

-- 8432S26 / Remera refugio
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera refugio', '8432S26', NULL, 35900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8432S26');
UPDATE products SET name = 'Remera refugio', price = 35900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8432S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '8432S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8432S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8432S26' AND v.color = 'BLANCA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '8432S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8432S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8432S26' AND v.color = 'NEGRA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8432S26';

-- 8438S26 / Remera filo
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera filo', '8438S26', NULL, 34500, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8438S26');
UPDATE products SET name = 'Remera filo', price = 34500,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8438S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS', 0 FROM products p
WHERE p.sku = '8438S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8438S26' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8438S26' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8438S26' AND v.color = 'GRIS';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8438S26';

-- 8466S26 / Remera travesía
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera travesía', '8466S26', NULL, 34900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8466S26');
UPDATE products SET name = 'Remera travesía', price = 34900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8466S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'MAGENTA', 0 FROM products p
WHERE p.sku = '8466S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'MAGENTA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8466S26' AND v.color = 'MAGENTA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8466S26' AND v.color = 'MAGENTA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8466S26' AND v.color = 'MAGENTA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8466S26';

-- 8468S26 / Remera cumbre
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera cumbre', '8468S26', NULL, 41000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8468S26');
UPDATE products SET name = 'Remera cumbre', price = 41000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8468S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'ROSA', 0 FROM products p
WHERE p.sku = '8468S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'ROSA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8468S26' AND v.color = 'ROSA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8468S26' AND v.color = 'ROSA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8468S26' AND v.color = 'ROSA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCA', 0 FROM products p
WHERE p.sku = '8468S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8468S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8468S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8468S26' AND v.color = 'BLANCA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8468S26' AND v.color = 'BLANCA';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '8468S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8468S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8468S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8468S26' AND v.color = 'NEGRA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8468S26';

-- 8544S26 / Remera altura
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera altura', '8544S26', NULL, 28000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8544S26');
UPDATE products SET name = 'Remera altura', price = 28000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8544S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'COLORADA', 0 FROM products p
WHERE p.sku = '8544S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'COLORADA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8544S26' AND v.color = 'COLORADA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8544S26' AND v.color = 'COLORADA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8544S26';

-- 8555526 / Remera quebrada
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera quebrada', '8555526', NULL, 44900, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8555526');
UPDATE products SET name = 'Remera quebrada', price = 44900,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8555526';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS', 0 FROM products p
WHERE p.sku = '8555526'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8555526' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8555526' AND v.color = 'GRIS';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8555526';

-- 8564S26 / Remera sendero
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera sendero', '8564S26', NULL, 34600, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8564S26');
UPDATE products SET name = 'Remera sendero', price = 34600,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8564S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'AMARILLO', 0 FROM products p
WHERE p.sku = '8564S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'AMARILLO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8564S26' AND v.color = 'AMARILLO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8564S26' AND v.color = 'AMARILLO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'ROJO', 0 FROM products p
WHERE p.sku = '8564S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'ROJO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 2
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8564S26' AND v.color = 'ROJO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8564S26' AND v.color = 'ROJO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8564S26';

-- 8588S26 / Remera vertiente
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Remera vertiente', '8588S26', NULL, 24500, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = '8588S26');
UPDATE products SET name = 'Remera vertiente', price = 24500,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = '8588S26';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'NEGRA', 0 FROM products p
WHERE p.sku = '8588S26'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'NEGRA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'S', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8588S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = '8588S26' AND v.color = 'NEGRA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = '8588S26' AND v.color = 'NEGRA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = '8588S26';

-- CALA / Cala
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Cala', 'CALA', NULL, 39800, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'CALA');
UPDATE products SET name = 'Cala', price = 39800,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = 'CALA';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BLANCO', 0 FROM products p
WHERE p.sku = 'CALA'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BLANCO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'CALA' AND v.color = 'BLANCO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'CALA' AND v.color = 'BLANCO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'TURQUESA', 0 FROM products p
WHERE p.sku = 'CALA'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'TURQUESA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'CALA' AND v.color = 'TURQUESA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'CALA' AND v.color = 'TURQUESA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'CALA';

-- GREY / Grey
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Grey', 'GREY', NULL, 38500, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'GREY');
UPDATE products SET name = 'Grey', price = 38500,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = 'GREY';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS', 0 FROM products p
WHERE p.sku = 'GREY'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'GREY' AND v.color = 'GRIS'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'GREY' AND v.color = 'GRIS';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'AZUL PETROLEO', 0 FROM products p
WHERE p.sku = 'GREY'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'AZUL PETROLEO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'GREY' AND v.color = 'AZUL PETROLEO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'GREY' AND v.color = 'AZUL PETROLEO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'GREY';

-- MOISSE / Moisse
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Moisse', 'MOISSE', NULL, 43000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'MOISSE');
UPDATE products SET name = 'Moisse', price = 43000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = 'MOISSE';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'BEIGE', 0 FROM products p
WHERE p.sku = 'MOISSE'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'BEIGE'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'MOISSE' AND v.color = 'BEIGE'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'MOISSE' AND v.color = 'BEIGE';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS CLARO', 0 FROM products p
WHERE p.sku = 'MOISSE'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS CLARO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'MOISSE' AND v.color = 'GRIS CLARO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'MOISSE' AND v.color = 'GRIS CLARO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'MOISSE';

-- POLY / Poly
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Poly', 'POLY', NULL, 44500, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'POLY');
UPDATE products SET name = 'Poly', price = 44500,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = 'POLY';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'VERDE OSCURO', 0 FROM products p
WHERE p.sku = 'POLY'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'VERDE OSCURO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'L', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'POLY' AND v.color = 'VERDE OSCURO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'POLY' AND v.color = 'VERDE OSCURO';
INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'AZUL', 0 FROM products p
WHERE p.sku = 'POLY'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'AZUL'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'M', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'POLY' AND v.color = 'AZUL'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'POLY' AND v.color = 'AZUL';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'POLY';

-- SIZE / Size
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Size', 'SIZE', NULL, 42400, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SIZE');
UPDATE products SET name = 'Size', price = 42400,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = 'SIZE';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'MOSTAZA', 0 FROM products p
WHERE p.sku = 'SIZE'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'MOSTAZA'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XXL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'SIZE' AND v.color = 'MOSTAZA'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'SIZE' AND v.color = 'MOSTAZA';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'SIZE';

-- SOLID / Solid
INSERT INTO products (name, sku, description, price, category_id, stock, featured)
SELECT 'Solid', 'SOLID', NULL, 41000, c.id, 0, false
FROM categories c
WHERE c.slug = 'remeras'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SOLID');
UPDATE products SET name = 'Solid', price = 41000,
  category_id = (SELECT id FROM categories WHERE slug = 'remeras')
WHERE sku = 'SOLID';

INSERT INTO product_variants (product_id, color, stock)
SELECT p.id, 'GRIS CLARO', 0 FROM products p
WHERE p.sku = 'SOLID'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = 'GRIS CLARO'
  );
INSERT INTO product_variant_sizes (variant_id, size, stock)
SELECT v.id, 'XL', 1
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.sku = 'SOLID' AND v.color = 'GRIS CLARO'
ON CONFLICT (variant_id, size) DO UPDATE SET stock = EXCLUDED.stock;
UPDATE product_variants v SET stock = COALESCE((
  SELECT SUM(s.stock)::int FROM product_variant_sizes s WHERE s.variant_id = v.id
), 0)
FROM products p
WHERE v.product_id = p.id AND p.sku = 'SOLID' AND v.color = 'GRIS CLARO';
UPDATE products p SET stock = COALESCE((
  SELECT SUM(v.stock)::int FROM product_variants v WHERE v.product_id = p.id
), 0)
WHERE p.sku = 'SOLID';

COMMIT;