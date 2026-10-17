-- Add variant_id column to cart_items table (optional, for products with color variants)
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE;

-- Update unique constraint to include variant_id
-- First, drop the old constraint if it exists
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_session_id_product_id_key;

-- Add new unique constraint that includes variant_id (allowing same product with different variants)
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_session_product_variant_unique 
  ON cart_items(session_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

