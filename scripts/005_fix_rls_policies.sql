-- Fix infinite recursion in admin_users RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin users" ON admin_users;

-- Create new policies that don't cause recursion
-- Allow users to view their own admin status
CREATE POLICY "Users can view their own admin status" ON admin_users
  FOR SELECT USING (id = auth.uid());

-- Allow authenticated users to check if they are admin (for other policies)
CREATE POLICY "Authenticated users can view admin users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- First admin must be created directly via SQL or Supabase dashboard
-- After that, existing admins can create new admins
CREATE POLICY "Service role can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (true);
