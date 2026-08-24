// Supabase Edge Function: cria um vendedor e envia o convite de acesso.
// Faça deploy com: supabase functions deploy admin-create-seller
// As chaves SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem no ambiente
// das Edge Functions do Supabase; APP_URL é opcional para definir o redirect.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ ok: false, error: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !serviceRoleKey || !anonKey || !token) return json({ ok: false, error: "Não autorizado." }, 401);

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ ok: false, error: "Sessão inválida." }, 401);

  const { data: account } = await admin.from("account_status").select("role").eq("id", authData.user.id).maybeSingle();
  if (account?.role !== "admin") return json({ ok: false, error: "Apenas administradores podem cadastrar vendedores." }, 403);

  const body = await request.json().catch(() => null) as { name?: string; email?: string } | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  if (!name || !email) return json({ ok: false, error: "Informe nome e e-mail." }, 400);

  // Novo vendedor usa o fluxo normal de signup: ele dispara o template
  // "Confirm sign up" configurado no Supabase, separado do Invite usado nas
  // compras. Depois de confirmar, o redirect abre /reset-password para a
  // pessoa trocar a senha temporária por uma senha própria.
  const redirectTo = `${Deno.env.get("APP_URL") ?? "https://app.bibliaverbo.com.br"}/reset-password`;
  const temporaryPassword = `${crypto.randomUUID()}!Aa9`;
  const signupResponse = await fetch(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ email, password: temporaryPassword }),
  });
  const signupText = await signupResponse.text();
  const signup = (() => {
    try { return JSON.parse(signupText) as { id?: string; user?: { id?: string }; msg?: string; message?: string; error_description?: string; error?: string }; }
    catch { return null; }
  })();
  const sellerId = signup?.user?.id ?? signup?.id;
  if (!signupResponse.ok || !sellerId) {
    const reason = signup?.msg ?? signup?.message ?? signup?.error_description ?? signup?.error ?? (signupText || "Não foi possível criar a conta.");
    const duplicate = /already|registered|exists/i.test(reason);
    console.error("admin-create-seller: signup failed", { status: signupResponse.status, reason });
    return json({ ok: false, error: duplicate ? "Já existe uma conta com este e-mail." : reason }, duplicate ? 409 : 500);
  }

  const [profile, accountStatus, sellerProfile] = await Promise.all([
    // Alguns projetos já têm trigger que cria profiles/account_status ao criar
    // auth.users. Upsert evita que esse fluxo legítimo vire erro de duplicidade.
    admin.from("profiles").upsert({ id: sellerId, church_name: "" }, { onConflict: "id", ignoreDuplicates: true }),
    admin.from("account_status").upsert({ id: sellerId, email, role: "seller", is_active: true }, { onConflict: "id" }),
    admin.from("seller_profiles").upsert({ id: sellerId, display_name: name }, { onConflict: "id" }),
  ]);
  const setupError = profile.error ?? accountStatus.error ?? sellerProfile.error;
  if (setupError) {
    const stage = profile.error ? "perfil" : accountStatus.error ? "status da conta" : "perfil de vendedor";
    console.error("admin-create-seller: setup failed", { stage, code: setupError.code, message: setupError.message });
    // Evita deixar uma conta parcialmente criada em caso de erro no banco.
    await admin.auth.admin.deleteUser(sellerId);
    return json({ ok: false, error: `Falha ao gravar ${stage}: ${setupError.message}` }, 500);
  }

  return json({ ok: true });
});
