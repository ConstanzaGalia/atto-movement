-- Seed Atto Labs: ropa deportiva mock (imágenes en /public/mock)
-- Se ejecuta con `supabase db reset`

-- Admin local: coco@atto.com / attoadmin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'coco@atto.com',
  extensions.crypt('attoadmin', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"is_admin": true, "full_name": "Coco Atto"}'::jsonb,
  false,
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  jsonb_build_object(
    'sub', 'a0000000-0000-4000-8000-000000000001',
    'email', 'coco@atto.com',
    'email_verified', true
  ),
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (provider_id, provider) DO NOTHING;

INSERT INTO public.admin_users (id, email, full_name)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'coco@atto.com',
  'Coco Atto'
)
ON CONFLICT (id) DO NOTHING;

-- Limpiar catálogo previo (idempotente)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM product_variant_sizes;
DELETE FROM product_variants;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;

-- Categorías técnicas
INSERT INTO categories (name, slug) VALUES
  ('Remeras & Musculosas', 'remeras-musculosas'),
  ('Shorts & Tights', 'shorts-tights'),
  ('Camperas & Windbreakers', 'camperas-windbreakers'),
  ('Accesorios Trail', 'accesorios-trail'),
  ('Gorras & Headwear', 'gorras-headwear');

-- Productos mock con fotos locales
INSERT INTO products (name, description, price, category_id, stock, image_url, featured)
VALUES
  (
    'Singlet Speed Doesn''t Matter',
    'SINGLET ULTRALIGERO // AEROPOLYMER 74G // CERO ROZAMIENTO // YUNGAS TESTED',
    48000,
    (SELECT id FROM categories WHERE slug = 'remeras-musculosas'),
    0,
    '/mock/gear-01.jpg',
    true
  ),
  (
    'Tempo Runner Short Sleeve',
    'REMERA MANGA CORTA // UPF 50+ // POLIÉSTER RECICLADO // DRY MATRIX',
    42000,
    (SELECT id FROM categories WHERE slug = 'remeras-musculosas'),
    0,
    '/mock/gear-02.jpg',
    true
  ),
  (
    'Long Sleeve UV Shield',
    'MANGA LARGA UV // SOLAR SHIELD 50+ // COSTURA TERMOSELLADA // TRAIL READY',
    56000,
    (SELECT id FROM categories WHERE slug = 'remeras-musculosas'),
    0,
    '/mock/gear-03.jpg',
    true
  ),
  (
    'No Run No Good Mood Tee',
    'REMERA TÉCNICA // PRINT REFLECTIVO // CORTE ERGONÓMICO // EVERYDAY RUN',
    38000,
    (SELECT id FROM categories WHERE slug = 'remeras-musculosas'),
    0,
    '/mock/gear-04.jpg',
    true
  ),
  (
    'Aero Mesh Race Tank',
    'MUSCULOSA MESH // VENTILACIÓN MAX // FLATLOCK // RACE DAY',
    44000,
    (SELECT id FROM categories WHERE slug = 'remeras-musculosas'),
    0,
    '/mock/gear-05.jpg',
    false
  ),
  (
    'Trail Split Short Acid Volt',
    'SHORT SPLIT // FORRO LIME // 4-WAY STRETCH // BOLSILLO GEL',
    52000,
    (SELECT id FROM categories WHERE slug = 'shorts-tights'),
    0,
    '/mock/gear-06.jpg',
    true
  ),
  (
    'Compression Tight Race',
    'TIGHT COMPRESIÓN // MUSLO A TOBILLO // SEAMLESS // HUMEDAD CRÍTICA',
    68000,
    (SELECT id FROM categories WHERE slug = 'shorts-tights'),
    0,
    '/mock/gear-07.jpg',
    true
  ),
  (
    'Tempo Short 5 Inch',
    'SHORT 5" // RIPSTOP LIGERO // CORDÓN INTERNO // DESPACHO EXPRESS',
    45000,
    (SELECT id FROM categories WHERE slug = 'shorts-tights'),
    0,
    '/mock/gear-08.jpg',
    true
  ),
  (
    'Trail Half Tight 3/4',
    'HALF TIGHT 3/4 // BOLSILLO TRASERO // GRIP CINTURA // ULTRA',
    62000,
    (SELECT id FROM categories WHERE slug = 'shorts-tights'),
    0,
    '/mock/gear-09.jpg',
    false
  ),
  (
    'Windbreaker Packable Shell',
    'WINDBREAKER EMPACABLE // 98G // CAPUCHA AJUSTABLE // NEÓN REFLECT',
    89000,
    (SELECT id FROM categories WHERE slug = 'camperas-windbreakers'),
    0,
    '/mock/gear-10.jpg',
    true
  ),
  (
    'Softshell Summit Midlayer',
    'SOFTSHELL MIDLAYER // VIENTO Y LLUVIA LIGERA // CREMALLERA YKK',
    112000,
    (SELECT id FROM categories WHERE slug = 'camperas-windbreakers'),
    0,
    '/mock/gear-11.jpg',
    false
  ),
  (
    'Hydra Vest Soft Flask Ready',
    'CHALECO HIDRATACIÓN // 2 FLASK FRONTALES // TRAMO LARGO // TUC TESTED',
    95000,
    (SELECT id FROM categories WHERE slug = 'camperas-windbreakers'),
    0,
    '/mock/gear-12.jpg',
    true
  ),
  (
    'Belt Pack Micro 1L',
    'CINTURÓN MICRO // 1L // GELS + LLAVE // ANTI-REBOTE',
    28000,
    (SELECT id FROM categories WHERE slug = 'accesorios-trail'),
    0,
    '/mock/gear-13.jpg',
    false
  ),
  (
    'Arm Sleeve Reflect 360',
    'MANGAS REFLECTIVAS // UPF 50+ // PAIR // NIGHT RUN',
    22000,
    (SELECT id FROM categories WHERE slug = 'accesorios-trail'),
    0,
    '/mock/gear-14.jpg',
    false
  ),
  (
    'Technical Cap Dry Peak',
    'GORRA TÉCNICA // MALLA TRASERA // SUDOR ABSORB // AJUSTE TRASERO',
    32000,
    (SELECT id FROM categories WHERE slug = 'gorras-headwear'),
    0,
    '/mock/gear-15.jpg',
    true
  ),
  (
    'Buff Tube Seamless',
    'BUFF SEAMLESS // MULTIUSO // CUELLO / CABEZA // QUICK DRY',
    18000,
    (SELECT id FROM categories WHERE slug = 'gorras-headwear'),
    0,
    '/mock/gear-16.jpg',
    false
  );

-- Variantes de color + talles con stock
DO $$
DECLARE
  r RECORD;
  v_id UUID;
  colors TEXT[];
  sizes TEXT[] := ARRAY['S', 'M', 'L', 'XL'];
  c TEXT;
  s TEXT;
  stock_qty INT;
  img TEXT;
BEGIN
  FOR r IN SELECT id, name, image_url FROM products LOOP
    img := COALESCE(r.image_url, '/placeholder.svg');

    IF r.name ILIKE '%acid%' OR r.name ILIKE '%volt%' THEN
      colors := ARRAY['Noir Matte', 'Acid Volt'];
    ELSIF r.name ILIKE '%cap%' OR r.name ILIKE '%buff%' THEN
      colors := ARRAY['Graphite', 'Optic White'];
    ELSIF r.name ILIKE '%windbreaker%' OR r.name ILIKE '%softshell%' OR r.name ILIKE '%vest%' THEN
      colors := ARRAY['Noir Matte', 'Graphite'];
    ELSIF r.name ILIKE '%tempo runner%' OR r.name ILIKE '%good mood%' OR r.name ILIKE '%aero mesh%' THEN
      colors := ARRAY['Optic White', 'Noir Matte'];
    ELSE
      colors := ARRAY['Noir Matte', 'Optic White'];
    END IF;

    FOREACH c IN ARRAY colors LOOP
      INSERT INTO product_variants (product_id, color, stock, image_url)
      VALUES (r.id, c, 0, img)
      RETURNING id INTO v_id;

      FOREACH s IN ARRAY sizes LOOP
        stock_qty := CASE
          WHEN r.name ILIKE '%belt%' OR r.name ILIKE '%sleeve%' OR r.name ILIKE '%buff%' THEN
            CASE s WHEN 'M' THEN 12 WHEN 'L' THEN 10 ELSE 8 END
          WHEN r.name ILIKE '%cap%' THEN
            CASE s WHEN 'M' THEN 15 WHEN 'L' THEN 12 ELSE 9 END
          ELSE
            CASE s
              WHEN 'S' THEN 6
              WHEN 'M' THEN 14
              WHEN 'L' THEN 12
              WHEN 'XL' THEN 7
            END
        END;

        INSERT INTO product_variant_sizes (variant_id, size, stock)
        VALUES (v_id, s, stock_qty);
      END LOOP;

      UPDATE product_variants
      SET stock = (SELECT COALESCE(SUM(stock), 0) FROM product_variant_sizes WHERE variant_id = v_id)
      WHERE id = v_id;
    END LOOP;

    UPDATE products p
    SET stock = (
      SELECT COALESCE(SUM(pvs.stock), 0)
      FROM product_variants pv
      JOIN product_variant_sizes pvs ON pvs.variant_id = pv.id
      WHERE pv.product_id = p.id
    )
    WHERE p.id = r.id;
  END LOOP;
END $$;

-- Hero slots
INSERT INTO hero_images (slot_index, image_url, alt_text, visible_on_mobile, display_order)
VALUES
  (1, '/hero-atto-desktop.png', 'Atto hero desktop', true, 1),
  (2, '/hero-atto-mobile.png', 'Atto hero mobile', true, 2),
  (3, '/mock/gear-01.jpg', 'Atto gear 03', true, 3),
  (4, '/mock/gear-06.jpg', 'Atto gear 04', true, 4),
  (5, '/mock/gear-10.jpg', 'Atto gear 05', false, 5),
  (6, '/mock/gear-15.jpg', 'Atto gear 06', true, 6)
ON CONFLICT (slot_index) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  alt_text = EXCLUDED.alt_text,
  visible_on_mobile = EXCLUDED.visible_on_mobile,
  display_order = EXCLUDED.display_order;

-- Proveedores
DELETE FROM suppliers;
INSERT INTO suppliers (name, address, phone) VALUES
  ('Ripstop Andes Textiles', 'Ruta 9 Km 12, Yerba Buena, Tucumán', '+54 9 381 555-0101'),
  ('Mesh Lab Córdoba', 'Av. Colón 2200, Córdoba', '+54 9 351 555-0202'),
  ('Trail Hardware BA', 'Palermo Hollywood, CABA', '+54 9 11 5555-0303');

UPDATE products SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Ripstop Andes Textiles')
WHERE name ILIKE '%singlet%' OR name ILIKE '%tempo%' OR name ILIKE '%long sleeve%';
UPDATE products SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Mesh Lab Córdoba')
WHERE name ILIKE '%short%' OR name ILIKE '%tight%' OR name ILIKE '%tank%';
UPDATE products SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Trail Hardware BA')
WHERE name ILIKE '%cap%' OR name ILIKE '%belt%' OR name ILIKE '%buff%' OR name ILIKE '%sleeve%';

-- Promoción demo
DELETE FROM promotion_products;
DELETE FROM promotions;
INSERT INTO promotions (name, type, discount_type, discount_value, starts_at, ends_at, is_active)
VALUES
  ('Release SS24/25', 'site_wide', 'percentage', 10, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', true),
  ('Trail Pack -5k', 'product_specific', 'fixed', 5000, NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days', true);

INSERT INTO promotion_products (promotion_id, product_id)
SELECT p.id, pr.id
FROM promotions p
CROSS JOIN products pr
WHERE p.name = 'Trail Pack -5k'
  AND pr.name ILIKE '%short%'
LIMIT 3;

-- Gift card demo
DELETE FROM gift_card_redemptions;
DELETE FROM gift_cards;
INSERT INTO gift_cards (code, initial_amount, balance, status, expires_at, notes)
VALUES
  ('ATTO-DEMO-2026', 25000, 25000, 'active', NOW() + INTERVAL '180 days', 'Seed demo'),
  ('ATTO-USED-HALF', 20000, 8000, 'active', NOW() + INTERVAL '90 days', 'Parcialmente usada');

-- Clientes CRM demo
DELETE FROM credit_movements;
DELETE FROM credit_accounts;
DELETE FROM customer_accounts;
INSERT INTO customer_accounts (email, full_name, phone, shipping_address, notes) VALUES
  ('lucia.trail@example.com', 'Lucía Fernández', '+54 9 381 411-2233', 'San Javier 450, Yerba Buena, Tucumán', 'Corredora habitual'),
  ('mateo.run@example.com', 'Mateo Ríos', '+54 9 381 422-3344', 'Av. Mate de Luna 1800, SM Tucumán', NULL),
  ('sofia.pack@example.com', 'Sofía Álvarez', '+54 9 11 6000-1122', 'Caballito, CABA', 'Cuenta corriente habilitada'),
  ('guest.ops@example.com', 'Juan Guest', '+54 9 381 400-9988', 'Tafí Viejo, Tucumán', 'Checkout guest');

INSERT INTO credit_accounts (customer_account_id, credit_limit, balance, enabled)
SELECT id, 150000, 42000, true FROM customer_accounts WHERE email = 'sofia.pack@example.com';

-- Pedidos demo (varios estados de cobro / logística)
DELETE FROM order_items;
DELETE FROM orders;

WITH p AS (
  SELECT id, name, price FROM products ORDER BY name LIMIT 6
),
ca AS (
  SELECT id, email, full_name, phone, shipping_address FROM customer_accounts
)
INSERT INTO orders (
  id, customer_name, customer_email, customer_phone, shipping_address,
  total_amount, status, notes, payment_status, payment_method, paid_at,
  payment_notes, shipping_cost, shipping_carrier, tracking_number,
  internal_notes, customer_account_id, gift_card_amount, created_at
)
VALUES
  (
    'a1111111-1111-4111-8111-111111111111',
    (SELECT full_name FROM ca WHERE email = 'lucia.trail@example.com'),
    'lucia.trail@example.com',
    (SELECT phone FROM ca WHERE email = 'lucia.trail@example.com'),
    (SELECT shipping_address FROM ca WHERE email = 'lucia.trail@example.com'),
    95000, 'delivered', 'Entregar después de 18hs',
    'paid', 'transfer', NOW() - INTERVAL '5 days',
    'Transferencia Banco Galicia ref 88221',
    0, 'Andreani', 'AND-998877',
    'Cliente VIP trail',
    (SELECT id FROM ca WHERE email = 'lucia.trail@example.com'),
    0, NOW() - INTERVAL '6 days'
  ),
  (
    'a2222222-2222-4222-8222-222222222222',
    (SELECT full_name FROM ca WHERE email = 'mateo.run@example.com'),
    'mateo.run@example.com',
    (SELECT phone FROM ca WHERE email = 'mateo.run@example.com'),
    (SELECT shipping_address FROM ca WHERE email = 'mateo.run@example.com'),
    58000, 'preparing', NULL,
    'awaiting_transfer', 'transfer', NULL,
    NULL, 5000, NULL, NULL,
    'Esperando comprobante',
    (SELECT id FROM ca WHERE email = 'mateo.run@example.com'),
    0, NOW() - INTERVAL '1 day'
  ),
  (
    'a3333333-3333-4333-8333-333333333333',
    (SELECT full_name FROM ca WHERE email = 'sofia.pack@example.com'),
    'sofia.pack@example.com',
    (SELECT phone FROM ca WHERE email = 'sofia.pack@example.com'),
    (SELECT shipping_address FROM ca WHERE email = 'sofia.pack@example.com'),
    42000, 'pending', 'Pedido a cuenta',
    'on_account', 'account_credit', NULL,
    NULL, 0, NULL, NULL,
    'Cargo CC',
    (SELECT id FROM ca WHERE email = 'sofia.pack@example.com'),
    0, NOW() - INTERVAL '2 days'
  ),
  (
    'a4444444-4444-4444-8444-444444444444',
    (SELECT full_name FROM ca WHERE email = 'guest.ops@example.com'),
    'guest.ops@example.com',
    (SELECT phone FROM ca WHERE email = 'guest.ops@example.com'),
    (SELECT shipping_address FROM ca WHERE email = 'guest.ops@example.com'),
    72000, 'pending', NULL,
    'paid', 'mixed', NOW() - INTERVAL '3 hours',
    'Gift + transfer resto',
    5000, NULL, NULL,
    NULL,
    (SELECT id FROM ca WHERE email = 'guest.ops@example.com'),
    15000, NOW() - INTERVAL '4 hours'
  ),
  (
    'a5555555-5555-4555-8555-555555555555',
    'Ana Mercado',
    'ana.mp@example.com',
    '+54 9 381 477-6655',
    'Concepción, Tucumán',
    48000, 'preparing', NULL,
    'paid', 'mercadopago', NOW() - INTERVAL '12 hours',
    'MP #demo',
    0, 'Correo Argentino', 'CA-123456',
    NULL, NULL, 0, NOW() - INTERVAL '1 day'
  ),
  (
    'a6666666-6666-4666-8666-666666666666',
    'Pedido Cancelado Demo',
    'cancel@example.com',
    '+54 9 381 400-0000',
    'Yerba Buena',
    38000, 'cancelled', 'Cliente canceló',
    'refunded', 'transfer', NULL,
    'Reembolso OK',
    5000, NULL, NULL,
    'No restock issues',
    NULL, 0, NOW() - INTERVAL '8 days'
  );

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, variant_color, variant_size)
SELECT
  'a1111111-1111-4111-8111-111111111111',
  id, name || ' - Negro - Talle M', price, 1, price, 'Negro', 'M'
FROM products WHERE name ILIKE '%singlet%' LIMIT 1;

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, variant_color, variant_size)
SELECT
  'a1111111-1111-4111-8111-111111111111',
  id, name || ' - Volt - Talle M', price, 1, price, 'Volt', 'M'
FROM products WHERE name ILIKE '%split short%' LIMIT 1;

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, variant_color, variant_size)
SELECT
  'a2222222-2222-4222-8222-222222222222',
  id, name || ' - Blanco - Talle L', price, 1, price, 'Blanco', 'L'
FROM products WHERE name ILIKE '%tempo%' LIMIT 1;

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, variant_color, variant_size)
SELECT
  'a3333333-3333-4333-8333-333333333333',
  id, name || ' - Negro - Talle M', price, 1, price, 'Negro', 'M'
FROM products WHERE name ILIKE '%compression%' OR name ILIKE '%tight%' LIMIT 1;

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, variant_color, variant_size)
SELECT
  'a4444444-4444-4444-8444-444444444444',
  id, name || ' - Negro - Talle S', price, 1, price, 'Negro', 'S'
FROM products WHERE name ILIKE '%wind%' OR name ILIKE '%campera%' OR name ILIKE '%jacket%' LIMIT 1;

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, variant_color, variant_size)
SELECT
  'a5555555-5555-4555-8555-555555555555',
  id, name || ' - Negro - Talle M', price, 1, price, 'Negro', 'M'
FROM products WHERE name ILIKE '%singlet%' OR name ILIKE '%tank%' LIMIT 1;

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, variant_color, variant_size)
SELECT
  'a6666666-6666-4666-8666-666666666666',
  id, name || ' - Blanco - Talle M', price, 1, price, 'Blanco', 'M'
FROM products WHERE name ILIKE '%mood%' OR name ILIKE '%tee%' LIMIT 1;

-- Movimiento CC por pedido a cuenta
INSERT INTO credit_movements (credit_account_id, type, amount, order_id, notes)
SELECT ca.id, 'charge', 42000, 'a3333333-3333-4333-8333-333333333333', 'Cargo pedido demo'
FROM credit_accounts ca
JOIN customer_accounts c ON c.id = ca.customer_account_id
WHERE c.email = 'sofia.pack@example.com';

-- Gastos del mes actual
DELETE FROM expenses;
INSERT INTO expenses (description, amount, expense_date, notes) VALUES
  ('Tela ripstop lote SS', 185000, (date_trunc('month', CURRENT_DATE) + INTERVAL '2 days')::date, 'Proveedor Andes'),
  ('Envíos Andreani quincena', 42000, (date_trunc('month', CURRENT_DATE) + INTERVAL '8 days')::date, NULL),
  ('Packaging + labels', 18500, (date_trunc('month', CURRENT_DATE) + INTERVAL '10 days')::date, 'Cajas negras'),
  ('Ads Meta / Instagram', 35000, CURRENT_DATE, 'Campaña Release');

-- Settings ops
UPDATE site_settings SET value = 'ops@atto.local' WHERE key = 'admin_notify_email';
UPDATE site_settings SET value = 'Transferí a Alias ATTO.LABS // enviá comprobante por WhatsApp' WHERE key = 'transfer_instructions';
