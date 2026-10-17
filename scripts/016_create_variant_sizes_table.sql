-- Create product_variant_sizes table for sizes and stock per size within a color variant
CREATE TABLE IF NOT EXISTS product_variant_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(variant_id, size)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_variant_sizes_variant ON product_variant_sizes(variant_id);
