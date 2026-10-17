-- Enable Row Level Security on product_variant_sizes table
ALTER TABLE product_variant_sizes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view variant sizes" ON product_variant_sizes
  FOR SELECT USING (true);

-- Admin only write access
CREATE POLICY "Only admins can insert variant sizes" ON product_variant_sizes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can update variant sizes" ON product_variant_sizes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can delete variant sizes" ON product_variant_sizes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
