// Supabase Edge Function: cria um vendedor e envia o convite de acesso.
// Faça deploy com: supabase functions deploy admin-create-seller --project-ref <ref da 123DEVS>
// As chaves SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem no ambiente
// das Edge Functions do Supabase; APP_URL é opcional para definir o redirect.
//
// O projeto Supabase é compartilhado com a 123DEVS (e outros produtos):
//   • as tabelas da Bíblia ficam no schema "biblia";
//   • o cadastro público é fechado, então a conta nasce por convite (servidor);
//   • a conta leva user_metadata.app = "biblia" — o modelo de e-mail usa isso
//     para mostrar a marca da Bíblia, e o trigger para criar o perfil.
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
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !serviceRoleKey || !token) return json({ ok: false, error: "Não autorizado." }, 401);

  const admin = createClient(url, serviceRoleKey, {
    db: { schema: "biblia" },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ ok: false, error: "Sessão inválida." }, 401);

  const { data: account } = await admin.from("account_status").select("role").eq("id", authData.user.id).maybeSingle();
  if (account?.role !== "admin") return json({ ok: false, error: "Apenas administradores podem cadastrar vendedores." }, 403);

  const body = await request.json().catch(() => null) as { name?: string; email?: string } | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  if (!name || !email) return json({ ok: false, error: "Informe nome e e-mail." }, 400);

  // Convite: dispara o modelo "Invite user" do Supabase. O link abre
  // /reset-password para a pessoa definir a própria senha.
  const redirectTo = `${Deno.env.get("APP_URL") ?? "https://app.bibliaverbo.com.br"}/reset-password`;
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { app: "biblia", role: "seller", full_name: name },
  });

  let sellerId = invited?.user?.id ?? null;
  let createdNow = Boolean(sellerId);
  if (!sellerId) {
    const reason = inviteError?.message ?? "Não foi possível criar a conta.";
    if (!/already|registered|exists/i.test(reason)) {
      console.error("admin-create-seller: invite failed", { reason });
      return json({ ok: false, error: reason }, 500);
    }
    // A pessoa já tem conta no Auth compartilhado (outro produto ou já é da
    // Bíblia). Se já for vendedora, avisa; senão, libera a Bíblia para ela.
    const { data: existingId } = await admin.rpc("user_id_by_email", { p_email: email });
    if (!existingId) return json({ ok: false, error: "Já existe uma conta com este e-mail." }, 409);
    const { data: existing } = await admin.from("account_status").select("role").eq("id", existingId).maybeSingle();
    if (existing?.role === "seller") return json({ ok: false, error: "Esta pessoa já é vendedora." }, 409);
    sellerId = existingId as string;
    createdNow = false;
  }

  const [profile, accountStatus, sellerProfile] = await Promise.all([
    // O trigger já cria o perfil para contas da Bíblia; upsert evita duplicidade.
    admin.from("profiles").upsert({ id: sellerId, church_name: "" }, { onConflict: "id", ignoreDuplicates: true }),
    admin.from("account_status").upsert({ id: sellerId, email, role: "seller", is_active: true }, { onConflict: "id" }),
    admin.from("seller_profiles").upsert({ id: sellerId, display_name: name }, { onConflict: "id" }),
  ]);
  const setupError = profile.error ?? accountStatus.error ?? sellerProfile.error;
  if (setupError) {
    const stage = profile.error ? "perfil" : accountStatus.error ? "status da conta" : "perfil de vendedor";
    console.error("admin-create-seller: setup failed", { stage, code: setupError.code, message: setupError.message });
    // Só desfaz a conta se ela acabou de ser criada aqui — nunca apaga a conta
    // de alguém que já existia em outro produto.
    if (createdNow) await admin.auth.admin.deleteUser(sellerId);
    return json({ ok: false, error: `Falha ao gravar ${stage}: ${setupError.message}` }, 500);
  }

  return json({ ok: true });
});
