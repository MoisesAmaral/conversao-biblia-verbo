-- ============================================================
-- Bíblia Verbo — App Web: contas, conteúdo do usuário e RLS
-- Mesmo projeto Supabase do app desktop (reaproveita versions/books/
-- chapters/verses como estão). Cole no SQL Editor do Supabase e execute.
-- ============================================================

-- ── 1. profiles — dados que o próprio usuário edita ──────────────────────
-- (nome/logo da igreja, preferências de tema/apresentação, listas locais)
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  church_name        TEXT NOT NULL DEFAULT '',
  church_logo_path   TEXT,
  ui_theme           TEXT NOT NULL DEFAULT 'dark',
  default_version_id UUID REFERENCES versions(id),
  safe_margins       BOOLEAN NOT NULL DEFAULT TRUE,
  auto_fit_font      BOOLEAN NOT NULL DEFAULT TRUE,
  transition         TEXT NOT NULL DEFAULT 'fade',
  default_theme      TEXT NOT NULL DEFAULT 'dark',
  default_font_size  INT NOT NULL DEFAULT 72,
  service_order      JSONB NOT NULL DEFAULT '[]',
  recent_items       JSONB NOT NULL DEFAULT '[]',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- INSERT liberado só da própria linha (nunca de outro id) — usado no primeiro
-- acesso, quando o app cria a linha de perfil se ela ainda não existir. Não
-- expõe nada sensível: role/is_active moram em account_status, travado abaixo.
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 2. account_status — role/is_active, NUNCA editável pelo dono ────────
-- Separado de "profiles" de propósito: se role/is_active morassem na mesma
-- linha que o usuário pode dar UPDATE, uma pessoa comum conseguiria se
-- promover a admin ou reativar a própria conta reembolsada.
CREATE TABLE IF NOT EXISTS account_status (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,                          -- só pro webhook reencontrar a conta por e-mail
  role       TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE account_status ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_account_status_email ON account_status (email);

ALTER TABLE account_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "account_status_select_own" ON account_status;
CREATE POLICY "account_status_select_own" ON account_status FOR SELECT USING (auth.uid() = id);
-- Sem policy de INSERT/UPDATE/DELETE pro cliente — só service-role escreve aqui.

-- Helper usado nas policies de escrita das tabelas de conteúdo abaixo, pra
-- que uma conta desativada (reembolso) pare de conseguir escrever mesmo que
-- o JWT dela ainda não tenha expirado — não é suficiente checar isso só no
-- login.
CREATE OR REPLACE FUNCTION is_active_user()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE((SELECT is_active FROM account_status WHERE id = auth.uid()), FALSE);
$$;

-- ── 3. folders / presentations — conteúdo do usuário ─────────────────────
CREATE TABLE IF NOT EXISTS folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "folders_all_own" ON folders;
CREATE POLICY "folders_select_own" ON folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "folders_write_own" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id AND is_active_user());
CREATE POLICY "folders_update_own" ON folders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND is_active_user());
CREATE POLICY "folders_delete_own" ON folders FOR DELETE USING (auth.uid() = user_id AND is_active_user());

CREATE TABLE IF NOT EXISTS presentations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id  UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  slides     JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presentations_select_own" ON presentations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "presentations_insert_own" ON presentations FOR INSERT WITH CHECK (auth.uid() = user_id AND is_active_user());
CREATE POLICY "presentations_update_own" ON presentations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND is_active_user());
CREATE POLICY "presentations_delete_own" ON presentations FOR DELETE USING (auth.uid() = user_id AND is_active_user());

-- ── 4. purchases — trilha de auditoria, sucessora de "licenses" ──────────
CREATE TABLE IF NOT EXISTS purchases (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hotmart_transaction_id TEXT UNIQUE NOT NULL,
  email                  TEXT NOT NULL,
  product                TEXT,
  status                 TEXT NOT NULL DEFAULT 'approved',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy pro cliente — só service-role (webhook) lê/escreve. Suporte
-- consulta direto pelo painel do Supabase, não pelo app.

-- ── 5. Admin — RPCs SECURITY DEFINER autenticadas por sessão real ────────
-- Mesmo padrão do supabase-setup.sql do app desktop (admin_list_licenses
-- etc.), só que agora auth.uid() + account_status.role substituem a senha
-- compartilhada por parâmetro.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM account_status WHERE id = auth.uid()), FALSE);
$$;

CREATE OR REPLACE FUNCTION admin_list_accounts()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.');
  END IF;
  RETURN (
    SELECT jsonb_build_object('ok', true, 'accounts',
      COALESCE(jsonb_agg(jsonb_build_object(
        'id', p.id, 'church_name', p.church_name, 'created_at', p.created_at,
        'is_active', s.is_active, 'role', s.role
      ) ORDER BY p.created_at DESC), '[]'::jsonb))
    FROM profiles p JOIN account_status s ON s.id = p.id
  );
END; $$;

CREATE OR REPLACE FUNCTION admin_toggle_active(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.');
  END IF;
  UPDATE account_status SET is_active = NOT is_active WHERE id = p_user_id;
  RETURN jsonb_build_object('ok', true);
END; $$;

-- ── 5b. Admin — vendas e métricas (painel de controle) ───────────────────
CREATE OR REPLACE FUNCTION admin_list_purchases(p_limit INT DEFAULT 100)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.');
  END IF;
  RETURN (
    SELECT jsonb_build_object('ok', true, 'purchases',
      COALESCE(jsonb_agg(row_to_json(t.*) ORDER BY t.created_at DESC), '[]'::jsonb))
    FROM (SELECT * FROM purchases ORDER BY created_at DESC LIMIT p_limit) t
  );
END; $$;

CREATE OR REPLACE FUNCTION admin_metrics()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.');
  END IF;
  RETURN jsonb_build_object(
    'ok', true,
    'total_purchases', (SELECT COUNT(*) FROM purchases),
    'approved_purchases', (SELECT COUNT(*) FROM purchases WHERE status = 'approved'),
    'active_accounts', (SELECT COUNT(*) FROM account_status WHERE is_active),
    'inactive_accounts', (SELECT COUNT(*) FROM account_status WHERE NOT is_active),
    'purchases_last_30d', (SELECT COUNT(*) FROM purchases WHERE created_at > NOW() - INTERVAL '30 days')
  );
END; $$;

-- Enquanto o webhook da Hotmart não existe (ele é quem cria essa linha em
-- produção), qualquer conta criada manualmente no painel (Authentication >
-- Users) fica sem account_status — e is_active_user() bloqueia escrita até
-- essa linha existir. Rode isto pra cada conta de teste (marque 'admin' só
-- na sua):
-- INSERT INTO account_status (id, role) VALUES ('<user-id>', 'user')
--   ON CONFLICT (id) DO UPDATE SET is_active = true;

-- ── 6. Storage — logo da igreja ───────────────────────────────────────────
-- Buckets do Supabase negam tudo por padrão até policies explícitas existirem.
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-logos', 'church-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "church_logos_read" ON storage.objects;
CREATE POLICY "church_logos_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'church-logos');

DROP POLICY IF EXISTS "church_logos_write_own" ON storage.objects;
CREATE POLICY "church_logos_write_own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'church-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "church_logos_update_own" ON storage.objects;
CREATE POLICY "church_logos_update_own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'church-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "church_logos_delete_own" ON storage.objects;
CREATE POLICY "church_logos_delete_own" ON storage.objects FOR DELETE
  USING (bucket_id = 'church-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
