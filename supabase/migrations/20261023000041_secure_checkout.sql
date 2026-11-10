-- Checkout seguro: precio y stock en una transacción, token de invitado,
-- reserva de stock impago y admins solo por fila en admin_users.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS view_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_held_until TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_restored_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_view_token
  ON orders (view_token)
  WHERE view_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_stock_hold
  ON orders (stock_held_until)
  WHERE stock_held_until IS NOT NULL AND stock_restored_at IS NULL;

INSERT INTO site_settings (key, value)
VALUES ('unpaid_hold_hours', '48')
ON CONFLICT (key) DO NOTHING;

-- El metadata is_admin deja de crear operadores.
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

CREATE OR REPLACE FUNCTION sync_stock_totals(p_size_variant_ids uuid[], p_product_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_size_variant_ids IS NOT NULL AND cardinality(p_size_variant_ids) > 0 THEN
    UPDATE product_variants pv
    SET stock = COALESCE((
      SELECT SUM(s.stock)::int
      FROM product_variant_sizes s
      WHERE s.variant_id = pv.id
    ), 0)
    WHERE pv.id = ANY (p_size_variant_ids);
  END IF;

  IF p_product_ids IS NULL OR cardinality(p_product_ids) = 0 THEN
    RETURN;
  END IF;

  UPDATE products p
  SET stock = COALESCE((
    SELECT SUM(s.stock)::int
    FROM product_variant_sizes s
    JOIN product_variants v ON v.id = s.variant_id
    WHERE v.product_id = p.id
  ), 0)
  WHERE p.id = ANY (p_product_ids)
    AND EXISTS (
      SELECT 1
      FROM product_variants v
      JOIN product_variant_sizes s ON s.variant_id = v.id
      WHERE v.product_id = p.id
    );

  UPDATE products p
  SET stock = COALESCE((
    SELECT SUM(v.stock)::int
    FROM product_variants v
    WHERE v.product_id = p.id
  ), 0)
  WHERE p.id = ANY (p_product_ids)
    AND EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)
    AND NOT EXISTS (
      SELECT 1
      FROM product_variants v
      JOIN product_variant_sizes s ON s.variant_id = v.id
      WHERE v.product_id = p.id
    );
END;
$$;

CREATE OR REPLACE FUNCTION restore_order_stock(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restored timestamptz;
  item record;
  v_size_variants uuid[] := '{}';
  v_products uuid[] := '{}';
  v_id uuid;
BEGIN
  SELECT stock_restored_at
  INTO v_restored
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND OR v_restored IS NOT NULL THEN
    RETURN;
  END IF;

  FOR v_id IN
    SELECT DISTINCT pid
    FROM (
      SELECT product_id AS pid
      FROM order_items
      WHERE order_id = p_order_id AND product_id IS NOT NULL
      UNION
      SELECT pv.product_id
      FROM order_items oi
      JOIN product_variant_sizes pvs ON pvs.id = oi.variant_size_id
      JOIN product_variants pv ON pv.id = pvs.variant_id
      WHERE oi.order_id = p_order_id
    ) ids
    WHERE pid IS NOT NULL
    ORDER BY pid
  LOOP
    PERFORM 1 FROM products WHERE id = v_id FOR UPDATE;
  END LOOP;

  FOR v_id IN
    SELECT DISTINCT vid
    FROM (
      SELECT variant_id AS vid
      FROM order_items
      WHERE order_id = p_order_id AND variant_id IS NOT NULL
      UNION
      SELECT pvs.variant_id
      FROM order_items oi
      JOIN product_variant_sizes pvs ON pvs.id = oi.variant_size_id
      WHERE oi.order_id = p_order_id
    ) ids
    WHERE vid IS NOT NULL
    ORDER BY vid
  LOOP
    PERFORM 1 FROM product_variants WHERE id = v_id FOR UPDATE;
  END LOOP;

  FOR v_id IN
    SELECT DISTINCT variant_size_id
    FROM order_items
    WHERE order_id = p_order_id AND variant_size_id IS NOT NULL
    ORDER BY variant_size_id
  LOOP
    PERFORM 1 FROM product_variant_sizes WHERE id = v_id FOR UPDATE;
  END LOOP;

  FOR item IN
    SELECT product_id, variant_id, variant_size_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    IF item.quantity IS NULL OR item.quantity < 1 THEN
      CONTINUE;
    END IF;

    IF item.variant_size_id IS NOT NULL THEN
      UPDATE product_variant_sizes
      SET stock = stock + item.quantity
      WHERE id = item.variant_size_id;

      SELECT variant_id INTO v_id FROM product_variant_sizes WHERE id = item.variant_size_id;
      IF v_id IS NOT NULL THEN
        v_size_variants := array_append(v_size_variants, v_id);
      END IF;
      IF item.product_id IS NOT NULL THEN
        v_products := array_append(v_products, item.product_id);
      END IF;
    ELSIF item.variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock = stock + item.quantity
      WHERE id = item.variant_id;
      IF item.product_id IS NOT NULL THEN
        v_products := array_append(v_products, item.product_id);
      END IF;
    ELSIF item.product_id IS NOT NULL THEN
      UPDATE products
      SET stock = stock + item.quantity
      WHERE id = item.product_id;
    END IF;
  END LOOP;

  PERFORM sync_stock_totals(v_size_variants, v_products);

  UPDATE orders
  SET stock_restored_at = now(),
      updated_at = now()
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION release_expired_orders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
  v_result jsonb := '[]'::jsonb;
BEGIN
  FOR rec IN
    SELECT id, customer_name, customer_email, total_amount, view_token, user_id
    FROM orders
    WHERE stock_held_until IS NOT NULL
      AND stock_held_until < now()
      AND stock_restored_at IS NULL
      AND status <> 'cancelled'
      AND payment_status IN ('unpaid', 'awaiting_transfer')
    ORDER BY id
    FOR UPDATE
  LOOP
    UPDATE orders
    SET status = 'cancelled',
        updated_at = now()
    WHERE id = rec.id;

    PERFORM restore_order_stock(rec.id);

    v_result := v_result || jsonb_build_array(
      jsonb_build_object(
        'id', rec.id,
        'customer_name', rec.customer_name,
        'customer_email', rec.customer_email,
        'total_amount', rec.total_amount,
        'view_token', rec.view_token,
        'user_id', rec.user_id
      )
    );
  END LOOP;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION place_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item record;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_gift numeric := 0;
  v_gift_id uuid;
  v_order_total numeric := 0;
  v_payable numeric := 0;
  v_order_id uuid;
  v_token text;
  v_payment_method text;
  v_payment_status text;
  v_hold_hours int := 48;
  v_held timestamptz;
  v_customer_account uuid;
  v_user_id uuid;
  v_catalog_price numeric;
  v_stock int;
  v_variant uuid;
  v_product uuid;
  v_line numeric;
  v_new_balance numeric;
  v_credit credit_accounts%ROWTYPE;
  v_card gift_cards%ROWTYPE;
  v_lines jsonb := '[]'::jsonb;
  v_size_variants uuid[] := '{}';
  v_products uuid[] := '{}';
  v_id uuid;
  v_use_credit boolean := false;
  v_name text;
BEGIN
  IF payload IS NULL
     OR jsonb_typeof(payload->'items') <> 'array'
     OR jsonb_array_length(payload->'items') = 0 THEN
    RAISE EXCEPTION 'EMPTY_CART';
  END IF;

  v_shipping := COALESCE((payload->>'shipping_cost')::numeric, 0);
  IF v_shipping < 0 THEN
    RAISE EXCEPTION 'INVALID_SHIPPING';
  END IF;

  v_payment_method := COALESCE(payload->>'payment_method', 'transfer');
  IF v_payment_method NOT IN ('transfer', 'mercadopago', 'account_credit') THEN
    v_payment_method := 'transfer';
  END IF;

  v_user_id := NULLIF(payload->>'user_id', '')::uuid;
  v_customer_account := NULLIF(payload->>'customer_account_id', '')::uuid;
  v_hold_hours := COALESCE(NULLIF(payload->>'hold_hours', '')::int, 48);
  IF v_hold_hours < 1 THEN
    v_hold_hours := 48;
  ELSIF v_hold_hours > 720 THEN
    v_hold_hours := 720;
  END IF;

  v_use_credit := COALESCE((payload->>'use_account_credit')::boolean, false)
    OR v_payment_method = 'account_credit';

  -- Mismo orden en todos los pedidos: producto, variante, talle.
  FOR v_id IN
    SELECT DISTINCT pid
    FROM (
      SELECT (elem->>'product_id')::uuid AS pid
      FROM jsonb_array_elements(payload->'items') elem
      WHERE COALESCE(elem->>'product_id', '') <> ''
      UNION
      SELECT pv.product_id
      FROM product_variant_sizes pvs
      JOIN product_variants pv ON pv.id = pvs.variant_id
      WHERE pvs.id IN (
        SELECT (elem->>'variant_size_id')::uuid
        FROM jsonb_array_elements(payload->'items') elem
        WHERE COALESCE(elem->>'variant_size_id', '') <> ''
      )
    ) ids
    WHERE pid IS NOT NULL
    ORDER BY pid
  LOOP
    PERFORM 1 FROM products WHERE id = v_id FOR UPDATE;
  END LOOP;

  FOR v_id IN
    SELECT DISTINCT vid
    FROM (
      SELECT (elem->>'variant_id')::uuid AS vid
      FROM jsonb_array_elements(payload->'items') elem
      WHERE COALESCE(elem->>'variant_id', '') <> ''
      UNION
      SELECT pvs.variant_id
      FROM product_variant_sizes pvs
      WHERE pvs.id IN (
        SELECT (elem->>'variant_size_id')::uuid
        FROM jsonb_array_elements(payload->'items') elem
        WHERE COALESCE(elem->>'variant_size_id', '') <> ''
      )
    ) ids
    WHERE vid IS NOT NULL
    ORDER BY vid
  LOOP
    PERFORM 1 FROM product_variants WHERE id = v_id FOR UPDATE;
  END LOOP;

  FOR v_id IN
    SELECT DISTINCT (elem->>'variant_size_id')::uuid
    FROM jsonb_array_elements(payload->'items') elem
    WHERE COALESCE(elem->>'variant_size_id', '') <> ''
    ORDER BY 1
  LOOP
    PERFORM 1 FROM product_variant_sizes WHERE id = v_id FOR UPDATE;
  END LOOP;

  FOR item IN
    SELECT *
    FROM jsonb_to_recordset(payload->'items') AS x(
      product_id uuid,
      product_name text,
      product_price numeric,
      quantity integer,
      variant_id uuid,
      variant_color text,
      variant_size_id uuid,
      variant_size text
    )
  LOOP
    IF item.product_id IS NULL OR item.quantity IS NULL OR item.quantity < 1 THEN
      RAISE EXCEPTION 'INVALID_ITEM';
    END IF;
    IF item.product_price IS NULL OR item.product_price < 0 THEN
      RAISE EXCEPTION 'INVALID_PRICE';
    END IF;

    SELECT price INTO v_catalog_price FROM products WHERE id = item.product_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
    END IF;
    IF item.product_price > v_catalog_price + 0.009 THEN
      RAISE EXCEPTION 'PRICE_ABOVE_CATALOG';
    END IF;

    v_name := COALESCE(NULLIF(item.product_name, ''), 'producto');
    v_line := ROUND(item.product_price * item.quantity, 2);
    v_subtotal := v_subtotal + v_line;

    IF item.variant_size_id IS NOT NULL THEN
      SELECT pvs.stock, pvs.variant_id, pv.product_id
      INTO v_stock, v_variant, v_product
      FROM product_variant_sizes pvs
      JOIN product_variants pv ON pv.id = pvs.variant_id
      WHERE pvs.id = item.variant_size_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'SIZE_NOT_FOUND';
      END IF;
      IF v_product <> item.product_id THEN
        RAISE EXCEPTION 'SIZE_PRODUCT_MISMATCH';
      END IF;
      IF item.variant_id IS NOT NULL AND v_variant <> item.variant_id THEN
        RAISE EXCEPTION 'SIZE_VARIANT_MISMATCH';
      END IF;
      IF v_stock < item.quantity THEN
        RAISE EXCEPTION 'STOCK_INSUFFICIENT: %', v_name;
      END IF;

      UPDATE product_variant_sizes
      SET stock = stock - item.quantity
      WHERE id = item.variant_size_id;

      v_size_variants := array_append(v_size_variants, v_variant);
      v_products := array_append(v_products, item.product_id);
    ELSIF item.variant_id IS NOT NULL THEN
      SELECT stock, product_id
      INTO v_stock, v_product
      FROM product_variants
      WHERE id = item.variant_id;

      IF NOT FOUND OR v_product <> item.product_id THEN
        RAISE EXCEPTION 'VARIANT_MISMATCH';
      END IF;
      IF v_stock < item.quantity THEN
        RAISE EXCEPTION 'STOCK_INSUFFICIENT: %', v_name;
      END IF;

      UPDATE product_variants
      SET stock = stock - item.quantity
      WHERE id = item.variant_id;

      v_products := array_append(v_products, item.product_id);
    ELSE
      SELECT stock INTO v_stock FROM products WHERE id = item.product_id;
      IF v_stock < item.quantity THEN
        RAISE EXCEPTION 'STOCK_INSUFFICIENT: %', v_name;
      END IF;

      UPDATE products
      SET stock = stock - item.quantity
      WHERE id = item.product_id;
    END IF;

    v_lines := v_lines || jsonb_build_array(
      jsonb_build_object(
        'product_id', item.product_id,
        'product_name', v_name,
        'product_price', item.product_price,
        'quantity', item.quantity,
        'subtotal', v_line,
        'variant_id', item.variant_id,
        'variant_color', item.variant_color,
        'variant_size_id', item.variant_size_id,
        'variant_size', item.variant_size
      )
    );
  END LOOP;

  PERFORM sync_stock_totals(v_size_variants, v_products);

  v_subtotal := ROUND(v_subtotal, 2);
  v_order_total := ROUND(v_subtotal + v_shipping, 2);

  IF COALESCE(NULLIF(trim(payload->>'gift_card_code'), ''), '') <> '' THEN
    SELECT *
    INTO v_card
    FROM gift_cards
    WHERE code = upper(trim(payload->>'gift_card_code'))
    FOR UPDATE;

    IF NOT FOUND OR v_card.status <> 'active' THEN
      RAISE EXCEPTION 'GIFT_CARD_INVALID';
    END IF;
    IF v_card.expires_at IS NOT NULL AND v_card.expires_at < now() THEN
      RAISE EXCEPTION 'GIFT_CARD_EXPIRED';
    END IF;
    IF v_card.balance <= 0 THEN
      RAISE EXCEPTION 'GIFT_CARD_EMPTY';
    END IF;

    v_gift := ROUND(LEAST(v_card.balance, v_order_total), 2);
    v_gift_id := v_card.id;
  END IF;

  v_payable := ROUND(GREATEST(v_order_total - v_gift, 0), 2);

  v_payment_status := 'awaiting_transfer';
  IF v_payment_method = 'mercadopago' THEN
    v_payment_status := 'unpaid';
  END IF;

  IF v_use_credit THEN
    v_payment_status := 'on_account';
    v_payment_method := CASE WHEN v_gift > 0 THEN 'mixed' ELSE 'account_credit' END;
  END IF;

  IF v_payable = 0 AND v_gift > 0 THEN
    v_payment_method := 'gift_card';
    v_payment_status := 'paid';
  ELSIF v_gift > 0 AND v_payment_method = 'transfer' THEN
    v_payment_method := 'mixed';
  END IF;

  IF v_payment_status = 'on_account' AND v_payable > 0 THEN
    IF v_customer_account IS NULL THEN
      RAISE EXCEPTION 'CREDIT_ACCOUNT_MISSING';
    END IF;

    SELECT *
    INTO v_credit
    FROM credit_accounts
    WHERE customer_account_id = v_customer_account
      AND enabled = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'CREDIT_DISABLED';
    END IF;
    IF v_credit.balance + v_payable > v_credit.credit_limit THEN
      RAISE EXCEPTION 'CREDIT_LIMIT';
    END IF;
  END IF;

  v_token := replace(uuid_generate_v4()::text, '-', '') || replace(uuid_generate_v4()::text, '-', '');

  IF v_payment_status IN ('unpaid', 'awaiting_transfer') THEN
    v_held := now() + make_interval(hours => v_hold_hours);
  ELSE
    v_held := NULL;
  END IF;

  INSERT INTO orders (
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    notes,
    total_amount,
    status,
    user_id,
    payment_status,
    payment_method,
    paid_at,
    shipping_cost,
    gift_card_amount,
    customer_account_id,
    view_token,
    stock_held_until
  ) VALUES (
    payload->>'customer_name',
    lower(trim(payload->>'customer_email')),
    NULLIF(trim(COALESCE(payload->>'customer_phone', '')), ''),
    payload->>'shipping_address',
    NULLIF(payload->>'notes', ''),
    v_order_total,
    'pending',
    v_user_id,
    v_payment_status,
    v_payment_method,
    CASE WHEN v_payment_status = 'paid' THEN now() ELSE NULL END,
    v_shipping,
    v_gift,
    v_customer_account,
    v_token,
    v_held
  )
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_price,
    quantity,
    subtotal,
    variant_id,
    variant_color,
    variant_size_id,
    variant_size
  )
  SELECT
    v_order_id,
    x.product_id,
    x.product_name,
    x.product_price,
    x.quantity,
    x.subtotal,
    x.variant_id,
    x.variant_color,
    x.variant_size_id,
    x.variant_size
  FROM jsonb_to_recordset(v_lines) AS x(
    product_id uuid,
    product_name text,
    product_price numeric,
    quantity integer,
    subtotal numeric,
    variant_id uuid,
    variant_color text,
    variant_size_id uuid,
    variant_size text
  );

  IF v_gift_id IS NOT NULL AND v_gift > 0 THEN
    v_new_balance := ROUND(v_card.balance - v_gift, 2);
    UPDATE gift_cards
    SET balance = v_new_balance,
        status = CASE WHEN v_new_balance <= 0 THEN 'depleted' ELSE 'active' END,
        updated_at = now()
    WHERE id = v_gift_id;

    INSERT INTO gift_card_redemptions (gift_card_id, order_id, amount)
    VALUES (v_gift_id, v_order_id, v_gift);
  END IF;

  IF v_payment_status = 'on_account' AND v_payable > 0 THEN
    v_new_balance := ROUND(v_credit.balance + v_payable, 2);
    UPDATE credit_accounts
    SET balance = v_new_balance,
        updated_at = now()
    WHERE id = v_credit.id;

    INSERT INTO credit_movements (credit_account_id, type, amount, order_id, notes)
    VALUES (v_credit.id, 'charge', v_payable, v_order_id, 'Cargo por pedido');
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'view_token', v_token,
    'payment_method', v_payment_method,
    'payment_status', v_payment_status,
    'payable_amount', v_payable,
    'shipping_cost', v_shipping,
    'gift_card_amount', v_gift,
    'subtotal', v_subtotal,
    'total_amount', v_order_total
  );
END;
$$;

REVOKE ALL ON FUNCTION sync_stock_totals(uuid[], uuid[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION restore_order_stock(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION release_expired_orders() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION place_order(jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION sync_stock_totals(uuid[], uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION restore_order_stock(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION release_expired_orders() TO service_role;
GRANT EXECUTE ON FUNCTION place_order(jsonb) TO service_role;
