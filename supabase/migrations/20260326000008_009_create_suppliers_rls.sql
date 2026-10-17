-- Enable Row Level Security on suppliers table
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view suppliers" ON suppliers
  FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Only admins can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can update suppliers" ON suppliers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can delete suppliers" ON suppliers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

