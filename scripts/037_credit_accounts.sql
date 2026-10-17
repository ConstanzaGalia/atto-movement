CREATE TABLE IF NOT EXISTS credit_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_account_id UUID NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
  credit_limit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (customer_account_id)
);

CREATE TABLE IF NOT EXISTS credit_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_account_id UUID NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('charge', 'payment', 'adjustment')),
  amount DECIMAL(10, 2) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_movements_account ON credit_movements(credit_account_id);

ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage credit_accounts" ON credit_accounts;
CREATE POLICY "Admins manage credit_accounts" ON credit_accounts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage credit_movements" ON credit_movements;
CREATE POLICY "Admins manage credit_movements" ON credit_movements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role credit_accounts" ON credit_accounts;
CREATE POLICY "Service role credit_accounts" ON credit_accounts
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role credit_movements" ON credit_movements;
CREATE POLICY "Service role credit_movements" ON credit_movements
  FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON credit_accounts TO anon, authenticated, service_role;
GRANT ALL ON credit_movements TO anon, authenticated, service_role;
