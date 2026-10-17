-- Enable Row Level Security on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own customer record
CREATE POLICY "Users can view own customer record" ON customers
  FOR SELECT USING (auth.uid() = id);

-- Policy: Authenticated users can insert their own customer record
CREATE POLICY "Users can insert own customer record" ON customers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update only their own customer record
CREATE POLICY "Users can update own customer record" ON customers
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can delete only their own customer record
CREATE POLICY "Users can delete own customer record" ON customers
  FOR DELETE USING (auth.uid() = id);

-- Policy: Admins can view all customer records
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Policy: Admins can update all customer records
CREATE POLICY "Admins can update all customers" ON customers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
