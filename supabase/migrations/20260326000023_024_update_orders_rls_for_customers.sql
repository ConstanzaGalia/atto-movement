-- Drop existing SELECT policy for orders (if exists)
DROP POLICY IF EXISTS "Only admins can view orders" ON orders;

-- New policy: Users can view their own orders, admins can view all
CREATE POLICY "Users can view own orders, admins can view all" ON orders
  FOR SELECT USING (
    -- Users can see their own orders
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR
    -- Admins can see all orders
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
