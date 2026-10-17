-- Limpia productos y pedidos para poder cargar datos reales.
-- Respeta foreign keys: borra en orden (ítems de pedidos → pedidos → carrito → talles → variantes → imágenes → productos).
-- No borra: categorías, clientes, admins.

-- 1. Ítems de pedidos
DELETE FROM order_items;

-- 2. Pedidos
DELETE FROM orders;

-- 3. Carrito (referencia a productos/variantes)
DELETE FROM cart_items;

-- 4. Talles de variantes
DELETE FROM product_variant_sizes;

-- 5. Variantes de productos
DELETE FROM product_variants;

-- 6. Imágenes de productos
DELETE FROM product_images;

-- 7. Productos
DELETE FROM products;

-- Opcional: reiniciar secuencias/contadores si usás IDs serial (en este proyecto usás UUID, no hace falta).
-- Las categorías se mantienen para que puedas asignarlas a los nuevos productos.
