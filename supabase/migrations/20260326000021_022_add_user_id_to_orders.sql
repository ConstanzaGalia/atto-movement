-- Add user_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
