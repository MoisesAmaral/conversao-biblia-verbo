-- ============================================================
-- Bíblia Verbo — limites de departamentos/apresentações
-- Mesmo projeto Supabase de supabase-schema.sql. Cole no SQL Editor e execute
-- DEPOIS do supabase-schema.sql (depende de folders/presentations já existirem).
-- Idempotente — pode rodar de novo sem problema.
-- ============================================================

-- Até 10 departamentos por usuário.
CREATE OR REPLACE FUNCTION enforce_folder_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM folders WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'folder_limit_reached' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_folder_limit ON folders;
CREATE TRIGGER trg_folder_limit BEFORE INSERT ON folders
  FOR EACH ROW EXECUTE FUNCTION enforce_folder_limit();

-- Até 20 apresentações por departamento.
CREATE OR REPLACE FUNCTION enforce_presentation_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM presentations WHERE folder_id = NEW.folder_id) >= 20 THEN
    RAISE EXCEPTION 'presentation_limit_reached' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_presentation_limit ON presentations;
CREATE TRIGGER trg_presentation_limit BEFORE INSERT ON presentations
  FOR EACH ROW EXECUTE FUNCTION enforce_presentation_limit();
