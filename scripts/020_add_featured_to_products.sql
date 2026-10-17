-- Add featured column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when querying featured products
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
