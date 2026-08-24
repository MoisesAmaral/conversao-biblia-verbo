-- ============================================================
-- Bíblia Verbo — vendedores, links de afiliado e leads
-- Execute depois de supabase-schema.sql e supabase-schema-sessions.sql.
-- A atribuição automática de venda depende de o webhook receber o código de
-- afiliado e gravá-lo em purchases.hotmart_affiliate_code.
-- ============================================================

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS hotmart_affiliate_code TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES account_status(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_affiliate_code ON purchases(hotmart_affiliate_code);

CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hotmart_url TEXT NOT NULL,
  affiliate_code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (affiliate_code)
);

CREATE TABLE IF NOT EXISTS seller_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE affiliate_links ALTER COLUMN seller_id SET DEFAULT auth.uid();
ALTER TABLE seller_leads ALTER COLUMN seller_id SET DEFAULT auth.uid();

ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_profiles_select_own" ON seller_profiles;
CREATE POLICY "seller_profiles_select_own" ON seller_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "affiliate_links_select_own" ON affiliate_links;
DROP POLICY IF EXISTS "affiliate_links_insert_own" ON affiliate_links;
DROP POLICY IF EXISTS "affiliate_links_update_own" ON affiliate_links;
DROP POLICY IF EXISTS "affiliate_links_delete_own" ON affiliate_links;
CREATE POLICY "affiliate_links_select_own" ON affiliate_links FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "affiliate_links_insert_own" ON affiliate_links FOR INSERT WITH CHECK (seller_id = auth.uid() AND is_active_user());
CREATE POLICY "affiliate_links_update_own" ON affiliate_links FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid() AND is_active_user());
CREATE POLICY "affiliate_links_delete_own" ON affiliate_links FOR DELETE USING (seller_id = auth.uid() AND is_active_user());
DROP POLICY IF EXISTS "seller_leads_select_own" ON seller_leads;
DROP POLICY IF EXISTS "seller_leads_insert_own" ON seller_leads;
DROP POLICY IF EXISTS "seller_leads_update_own" ON seller_leads;
DROP POLICY IF EXISTS "seller_leads_delete_own" ON seller_leads;
CREATE POLICY "seller_leads_select_own" ON seller_leads FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "seller_leads_insert_own" ON seller_leads FOR INSERT WITH CHECK (seller_id = auth.uid() AND is_active_user());
CREATE POLICY "seller_leads_update_own" ON seller_leads FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid() AND is_active_user());
CREATE POLICY "seller_leads_delete_own" ON seller_leads FOR DELETE USING (seller_id = auth.uid() AND is_active_user());

-- Chamado pelo webhook depois de gravar/atualizar uma venda. O código deve ser
-- único entre vendedores; se não houver correspondência, a compra permanece
-- sem atribuição, que é mais seguro que creditá-la à pessoa errada.
CREATE OR REPLACE FUNCTION assign_purchase_to_seller(p_transaction_id TEXT, p_affiliate_code TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_seller_id UUID;
BEGIN
  SELECT seller_id INTO v_seller_id FROM affiliate_links
   WHERE affiliate_code = p_affiliate_code AND is_active LIMIT 1;
  IF v_seller_id IS NOT NULL THEN
    UPDATE purchases SET seller_id = v_seller_id, hotmart_affiliate_code = p_affiliate_code
     WHERE hotmart_transaction_id = p_transaction_id;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION seller_dashboard()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM seller_profiles WHERE id = auth.uid() AND is_active) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Acesso de vendedor não encontrado ou inativo.');
  END IF;
  RETURN jsonb_build_object(
    'ok', true,
    'links', (SELECT COUNT(*) FROM affiliate_links WHERE seller_id = auth.uid() AND is_active),
    'leads', (SELECT COUNT(*) FROM seller_leads WHERE seller_id = auth.uid()),
    'new_leads', (SELECT COUNT(*) FROM seller_leads WHERE seller_id = auth.uid() AND status = 'new'),
    'approved_sales', (SELECT COUNT(*) FROM purchases WHERE seller_id = auth.uid() AND status = 'approved'),
    'sales_last_30d', (SELECT COUNT(*) FROM purchases WHERE seller_id = auth.uid() AND status = 'approved' AND created_at > NOW() - INTERVAL '30 days')
  );
END; $$;

CREATE OR REPLACE FUNCTION admin_list_sellers()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.'); END IF;
  RETURN jsonb_build_object('ok', true, 'sellers', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', sp.id, 'display_name', sp.display_name, 'email', a.email, 'is_active', sp.is_active, 'created_at', sp.created_at,
      'links', (SELECT COUNT(*) FROM affiliate_links al WHERE al.seller_id = sp.id AND al.is_active),
      'leads', (SELECT COUNT(*) FROM seller_leads sl WHERE sl.seller_id = sp.id),
      'approved_sales', (SELECT COUNT(*) FROM purchases p WHERE p.seller_id = sp.id AND p.status = 'approved')
    ) ORDER BY sp.created_at DESC) FROM seller_profiles sp JOIN account_status a ON a.id = sp.id
  ), '[]'::jsonb));
END; $$;

CREATE OR REPLACE FUNCTION admin_toggle_seller_active(p_seller_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_active BOOLEAN;
BEGIN
  IF NOT is_admin() THEN RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.'); END IF;
  UPDATE seller_profiles SET is_active = NOT is_active WHERE id = p_seller_id RETURNING is_active INTO v_active;
  IF v_active IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'Vendedor não encontrado.'); END IF;
  UPDATE account_status SET is_active = v_active WHERE id = p_seller_id;
  RETURN jsonb_build_object('ok', true, 'is_active', v_active);
END; $$;

GRANT EXECUTE ON FUNCTION assign_purchase_to_seller(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION seller_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_list_sellers() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_seller_active(UUID) TO authenticated;
