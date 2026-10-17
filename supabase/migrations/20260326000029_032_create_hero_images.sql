-- Hero collage images for homepage
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_index INTEGER NOT NULL UNIQUE CHECK (slot_index BETWEEN 1 AND 6),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  visible_on_mobile BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_images_display_order ON hero_images(display_order);

-- Seed default collage (matches current hardcoded home)
INSERT INTO hero_images (slot_index, image_url, alt_text, visible_on_mobile, display_order) VALUES
  (1, '/collage1.jpeg', 'Atto Outfit 1', true, 1),
  (2, '/collage3.jpeg', 'Atto Outfit 3', false, 2),
  (3, '/collage4.jpeg', 'Atto Outfit 4', true, 3),
  (4, '/collage6.jpeg', 'Atto Outfit 6', true, 4),
  (5, '/collage2.jpeg', 'Atto Outfit 2', false, 5),
  (6, '/collage5.jpeg', 'Atto Outfit 5', true, 6)
ON CONFLICT (slot_index) DO NOTHING;

-- RLS
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hero_images" ON hero_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert hero_images" ON hero_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update hero_images" ON hero_images
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete hero_images" ON hero_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
