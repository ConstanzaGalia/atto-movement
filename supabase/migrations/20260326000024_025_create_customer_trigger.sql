-- Function to automatically create customers entry on signup (for non-admin users)
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create customers entry if user does NOT have is_admin metadata
  IF NOT COALESCE((NEW.raw_user_meta_data ->> 'is_admin')::boolean, false) THEN
    INSERT INTO public.customers (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to call function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_customer ON auth.users;

CREATE TRIGGER on_auth_user_created_customer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer();
