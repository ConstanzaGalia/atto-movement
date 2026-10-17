CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  initial_amount DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'depleted')),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_card ON gift_card_redemptions(gift_card_id);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage gift_cards" ON gift_cards;
CREATE POLICY "Admins manage gift_cards" ON gift_cards
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage gift_card_redemptions" ON gift_card_redemptions;
CREATE POLICY "Admins manage gift_card_redemptions" ON gift_card_redemptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role gift_cards" ON gift_cards;
CREATE POLICY "Service role gift_cards" ON gift_cards
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role gift_card_redemptions" ON gift_card_redemptions;
CREATE POLICY "Service role gift_card_redemptions" ON gift_card_redemptions
  FOR ALL USING (auth.role() = 'service_role');

-- Public can read active gift cards by code via service role only in API; no anon select of full table.
GRANT ALL ON gift_cards TO anon, authenticated, service_role;
GRANT ALL ON gift_card_redemptions TO anon, authenticated, service_role;
