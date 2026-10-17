-- Index for listing product_images by product_id (used in admin and product page)
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
