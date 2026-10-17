-- Enable Row Level Security on product_variants table
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view product variants" ON product_variants
  FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Only admins can insert product variants" ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can update product variants" ON product_variants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can delete product variants" ON product_variants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

