CREATE TABLE IF NOT EXISTS customer_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  shipping_address TEXT,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_accounts_email_lower ON customer_accounts (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_customer_accounts_user_id ON customer_accounts(user_id);

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_customer_account_id_fkey;

ALTER TABLE orders
  ADD CONSTRAINT orders_customer_account_id_fkey
  FOREIGN KEY (customer_account_id) REFERENCES customer_accounts(id) ON DELETE SET NULL;

ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage customer_accounts" ON customer_accounts;
CREATE POLICY "Admins manage customer_accounts" ON customer_accounts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role customer_accounts" ON customer_accounts;
CREATE POLICY "Service role customer_accounts" ON customer_accounts
  FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON customer_accounts TO anon, authenticated, service_role;
