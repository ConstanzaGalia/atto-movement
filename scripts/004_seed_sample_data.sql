-- Insert sample categories
INSERT INTO categories (name, slug) VALUES
  ('Remeras', 'remeras'),
  ('Pantalones', 'pantalones'),
  ('Vestidos', 'vestidos'),
  ('Accesorios', 'accesorios')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Remera Básica Negra',
  'Remera de algodón 100% con cuello redondo. Perfecta para el día a día.',
  3500.00,
  id,
  25,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'remeras'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Remera Oversize Blanca',
  'Remera oversize de algodón con diseño moderno y cómodo.',
  4200.00,
  id,
  18,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'remeras'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Jean Recto Azul',
  'Jean de corte recto clásico. Tela de alta calidad con stretch.',
  8900.00,
  id,
  12,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'pantalones'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Pantalón Cargo Negro',
  'Pantalón cargo con múltiples bolsillos. Diseño urbano y funcional.',
  7500.00,
  id,
  15,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'pantalones'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Vestido Midi Floral',
  'Vestido midi con estampado floral. Ideal para eventos casuales.',
  12500.00,
  id,
  8,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'vestidos'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Vestido Largo Negro',
  'Vestido largo elegante para ocasiones especiales.',
  15800.00,
  id,
  5,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'vestidos'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Cartera Crossbody',
  'Cartera pequeña crossbody de cuero sintético. Perfecta para salidas.',
  5200.00,
  id,
  20,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'accesorios'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, stock, image_url)
SELECT 
  'Gorra Bordada',
  'Gorra con bordado personalizado. Ajustable.',
  2800.00,
  id,
  30,
  '/placeholder.svg?height=400&width=400'
FROM categories WHERE slug = 'accesorios'
ON CONFLICT DO NOTHING;
