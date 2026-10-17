-- RLS for promotions: anyone can read (for active promos API), only admins can write
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;

-- Promotions: public read, admin write
CREATE POLICY "Anyone can read promotions" ON promotions
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert promotions" ON promotions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update promotions" ON promotions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete promotions" ON promotions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Promotion products: public read, admin write
CREATE POLICY "Anyone can read promotion_products" ON promotion_products
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert promotion_products" ON promotion_products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete promotion_products" ON promotion_products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
