-- Add variant_size_id column to cart_items table (optional, for products with size variants)
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS variant_size_id UUID REFERENCES product_variant_sizes(id) ON DELETE CASCADE;

-- Drop the old unique constraint/index if it exists
DROP INDEX IF EXISTS cart_items_session_product_variant_unique;

-- Add new unique constraint that includes variant_size_id
-- This allows same product with different variants and sizes
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_session_product_variant_size_unique 
  ON cart_items(
    session_id, 
    product_id, 
    COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(variant_size_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
