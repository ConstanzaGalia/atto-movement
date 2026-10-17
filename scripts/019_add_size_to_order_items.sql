-- Add variant_size_id and variant_size to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_size_id UUID REFERENCES product_variant_sizes(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_size TEXT;
