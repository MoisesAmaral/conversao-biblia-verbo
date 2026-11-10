import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// O projeto Supabase é compartilhado com a 123DEVS: as tabelas da Bíblia
// ficam no schema "biblia" (antes, "public").
export const supabase = createClient(url, key, {
  db: { schema: "biblia" },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
