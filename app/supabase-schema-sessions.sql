-- ============================================================
-- Bíblia Verbo — sessão única por conta (web + desktop)
-- Mesmo projeto Supabase de supabase-schema.sql. Cole no SQL Editor e execute
-- DEPOIS do supabase-schema.sql (depende de account_status e is_admin() já existirem).
-- Idempotente — pode rodar de novo sem problema.
-- ============================================================

ALTER TABLE account_status ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE account_status ADD COLUMN IF NOT EXISTS session_device_label TEXT;
ALTER TABLE account_status ADD COLUMN IF NOT EXISTS session_claimed_at TIMESTAMPTZ;
-- Presença mais recente. Sessões sem atividade por 5 minutos deixam de bloquear
-- o próximo login; o cliente também avisa e encerra a sessão localmente.
ALTER TABLE account_status ADD COLUMN IF NOT EXISTS session_last_seen_at TIMESTAMPTZ;

-- Reserva a sessão pro dispositivo atual. Chamada logo após signInWithPassword
-- ter sucesso (e também no bootstrap, pra reafirmar uma sessão já persistida).
-- Idempotente pro mesmo session_id — o próprio dispositivo reabrindo/atualizando
-- a página nunca se autobloqueia. Só bloqueia se já existir um session_id
-- DIFERENTE e não-nulo gravado (outra máquina com sessão viva).
CREATE OR REPLACE FUNCTION claim_session(p_session_id UUID, p_device_label TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current UUID; v_label TEXT; v_claimed_at TIMESTAMPTZ; v_last_seen TIMESTAMPTZ;
  v_is_admin BOOLEAN; v_is_active BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT session_id, session_device_label, session_claimed_at, session_last_seen_at,
         role = 'admin', is_active
    INTO v_current, v_label, v_claimed_at, v_last_seen, v_is_admin, v_is_active
    FROM account_status WHERE id = auth.uid() FOR UPDATE;

  IF NOT COALESCE(v_is_active, FALSE) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'account_inactive');
  END IF;

  -- Admin pode assumir a sessão em outra máquina. Para os demais, uma sessão
  -- só bloqueia se ainda teve atividade nos últimos cinco minutos.
  IF v_current IS NOT NULL AND v_current <> p_session_id
     AND NOT COALESCE(v_is_admin, FALSE)
     AND COALESCE(v_last_seen, v_claimed_at) > NOW() - INTERVAL '5 minutes' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_in_use',
      'device_label', v_label, 'claimed_at', v_claimed_at);
  END IF;

  UPDATE account_status
     SET session_id = p_session_id,
         session_device_label = p_device_label,
         session_claimed_at = CASE WHEN v_current IS DISTINCT FROM p_session_id
                                    THEN NOW() ELSE session_claimed_at END,
         session_last_seen_at = NOW()
   WHERE id = auth.uid();

  RETURN jsonb_build_object('ok', true);
END; $$;

-- Libera a vaga no logout explícito. Só libera se for o mesmo session_id que
-- está segurando (evita que uma instância antiga libere a vaga de um login
-- mais novo por engano).
CREATE OR REPLACE FUNCTION release_session(p_session_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  UPDATE account_status
     SET session_id = NULL, session_device_label = NULL, session_claimed_at = NULL
   WHERE id = auth.uid() AND session_id = p_session_id;
  RETURN jsonb_build_object('ok', true);
END; $$;

-- Remédio de suporte pro painel admin — mesmo padrão de is_admin() já usado em
-- admin_toggle_active. Único jeito de liberar uma vaga sem ser pelo próprio
-- dispositivo (ex.: aparelho perdido/formatado).
CREATE OR REPLACE FUNCTION admin_release_session(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.');
  END IF;
  UPDATE account_status
     SET session_id = NULL, session_device_label = NULL, session_claimed_at = NULL
   WHERE id = p_user_id;
  RETURN jsonb_build_object('ok', true);
END; $$;

-- Renova a presença somente da sessão que ainda é a atual. Se outro dispositivo
-- admin assumiu a vaga, ou a conta foi desativada, o cliente recebe ok=false e
-- desloga localmente.
CREATE OR REPLACE FUNCTION heartbeat_session(p_session_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  UPDATE account_status SET session_last_seen_at = NOW()
   WHERE id = auth.uid() AND session_id = p_session_id AND is_active;
  IF FOUND THEN RETURN jsonb_build_object('ok', true); END IF;
  RETURN jsonb_build_object('ok', false, 'error', 'session_not_current');
END; $$;

-- admin_list_accounts (CREATE OR REPLACE da função já existente em
-- supabase-schema.sql) passa a incluir os campos de sessão, pro painel admin
-- mostrar "em uso em: X desde: Y" e oferecer o botão de liberar.
CREATE OR REPLACE FUNCTION admin_list_accounts()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Acesso negado.');
  END IF;
  RETURN (
    SELECT jsonb_build_object('ok', true, 'accounts',
      COALESCE(jsonb_agg(jsonb_build_object(
        'id', p.id, 'church_name', p.church_name, 'email', s.email, 'created_at', p.created_at,
        'is_active', s.is_active, 'role', s.role,
        'session_device_label', s.session_device_label,
        'session_claimed_at', s.session_claimed_at,
        'session_last_seen_at', s.session_last_seen_at
      ) ORDER BY p.created_at DESC), '[]'::jsonb))
    FROM profiles p JOIN account_status s ON s.id = p.id
  );
END; $$;

GRANT EXECUTE ON FUNCTION claim_session(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION release_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION heartbeat_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_release_session(UUID) TO authenticated;
