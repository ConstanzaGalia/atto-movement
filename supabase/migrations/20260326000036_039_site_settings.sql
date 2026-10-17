CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('shipping_base_cost', '5000'),
  ('free_shipping_threshold', '50000'),
  ('admin_notify_email', ''),
  ('transfer_instructions', 'Te enviamos los datos de transferencia por WhatsApp al confirmar el pedido.')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site_settings" ON site_settings;
CREATE POLICY "Anyone can read site_settings" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage site_settings" ON site_settings;
CREATE POLICY "Admins manage site_settings" ON site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

GRANT ALL ON site_settings TO anon, authenticated, service_role;
