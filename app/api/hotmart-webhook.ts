// Webhook da Hotmart — cria/desativa a conta do usuário automaticamente quando uma
// compra é aprovada/reembolsada. Roda como Edge Function na Vercel: sem CORS (é
// servidor-a-servidor), e usa a service-role key do Supabase — que NUNCA pode ter
// prefixo VITE_ (isso vazaria pro bundle do navegador) e só existe aqui.
//
// A Hotmart tem dois formatos de payload em uso (postback clássico com campos soltos
// na raiz, e a API v2 aninhada em "data") — este handler cobre os dois de propósito,
// porque não consegui confirmar com certeza qual sua conta usa sem ver um payload real.
// ANTES de confiar nisto em produção: no painel da Hotmart, Ferramentas > Webhook,
// use "Enviar teste" e confira se os campos abaixo (email, transaction, status/event)
// batem com o que chega — ajuste se não bater.
export const config = { runtime: "edge" };

const APPROVED = new Set(["approved", "complete", "completed"]);
const REVOKED = new Set(["canceled", "cancelled", "refunded", "chargeback", "expired", "dispute", "blocked"]);

async function supabaseAdminRequest(path: string, init: RequestInit): Promise<Response> {
  const url = `${process.env.VITE_SUPABASE_URL}${path}`;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(init.headers ?? {}),
    },
  });
}

async function findAccountIdByEmail(email: string): Promise<string | null> {
  const res = await supabaseAdminRequest(`/rest/v1/account_status?select=id&email=eq.${encodeURIComponent(email)}&limit=1`, { method: "GET" });
  if (!res.ok) return null;
  const rows = (await res.json()) as { id: string }[];
  return rows[0]?.id ?? null;
}

async function setActive(accountId: string, isActive: boolean): Promise<void> {
  await supabaseAdminRequest(`/rest/v1/account_status?id=eq.${accountId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ is_active: isActive }),
  });
}

async function inviteUser(email: string): Promise<{ userId: string | null; alreadyExists: boolean }> {
  // redirect_to explícito: não depender só do "Site URL" configurado no painel do
  // Supabase (que já ficou apontando pra um esquema errado uma vez e quebrou o link
  // do convite). Precisa estar na allowlist de "Redirect URLs" em Authentication →
  // URL Configuration, senão o Supabase ignora isso e usa o Site URL mesmo assim.
  const res = await supabaseAdminRequest(`/auth/v1/invite?redirect_to=${encodeURIComponent("https://app.bibliaverbo.com.br/reset-password")}`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (res.ok) {
    const user = (await res.json()) as { id: string };
    return { userId: user.id, alreadyExists: false };
  }
  // Supabase retorna erro se o e-mail já tem conta — não é uma falha real aqui.
  const body = await res.text();
  if (res.status === 422 || /already.*regist/i.test(body)) {
    return { userId: null, alreadyExists: true };
  }
  throw new Error(`Falha ao convidar usuário: ${res.status} ${body}`);
}

async function upsertPurchase(transactionId: string, email: string, product: string | null, status: string) {
  await supabaseAdminRequest("/rest/v1/purchases?on_conflict=hotmart_transaction_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ hotmart_transaction_id: transactionId, email, product, status }),
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  // Hotmart manda o "hottok" da conta dentro do próprio corpo (não é assinatura HMAC
  // de header) — compara com o valor de Ferramentas > Webhook > Autenticação.
  const hottok = body.hottok ?? body.data?.hottok;
  if (!hottok || hottok !== process.env.HOTMART_HOTTOK) {
    // Sem payload completo no log de propósito — pode conter dados do comprador.
    console.error("hotmart-webhook: hottok não bateu (evento:", body.event ?? body.status ?? "desconhecido", ")");
    return new Response("Unauthorized", { status: 401 });
  }

  const event: string | undefined = body.event;
  const status: string | undefined = (body.status ?? body.data?.purchase?.status ?? body.data?.status ?? "").toLowerCase();
  const email: string | undefined = body.email ?? body.data?.buyer?.email ?? body.data?.purchase?.buyer?.email;
  const transactionId: string | undefined = body.transaction ?? body.data?.purchase?.transaction ?? body.data?.transaction;
  const product: string | null = (body.prod ?? body.data?.product?.id ?? null)?.toString() ?? null;

  if (!email || !transactionId) {
    return new Response("Missing required fields (email/transaction)", { status: 400 });
  }

  // Idempotência primeiro: a Hotmart reenvia o webhook se não receber 200 rápido, e o
  // registro de compra não pode duplicar efeito — upsert por transaction_id resolve isso
  // independente do resultado do resto do handler.
  await upsertPurchase(transactionId, email, product, status || event || "unknown");

  const isApproved = event === "PURCHASE_APPROVED" || event === "PURCHASE_COMPLETE" || APPROVED.has(status);
  const isRevoked =
    event === "PURCHASE_REFUNDED" || event === "PURCHASE_CANCELED" || event === "PURCHASE_CHARGEBACK" || REVOKED.has(status);

  try {
    if (isApproved) {
      const { userId, alreadyExists } = await inviteUser(email);
      if (userId) {
        // Conta nova — cria profiles + account_status. profiles usa a policy own-insert,
        // mas aqui é a service-role escrevendo, que ignora RLS de qualquer forma.
        await supabaseAdminRequest("/rest/v1/profiles", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ id: userId, church_name: "" }),
        });
        await supabaseAdminRequest("/rest/v1/account_status", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ id: userId, email, role: "user", is_active: true }),
        });
      } else if (alreadyExists) {
        // Recompra ou reativação — só garante acesso, sem duplicar conta.
        const existingId = await findAccountIdByEmail(email);
        if (existingId) await setActive(existingId, true);
      }
    } else if (isRevoked) {
      const existingId = await findAccountIdByEmail(email);
      if (existingId) await setActive(existingId, false);
    }
  } catch (e: any) {
    // Já gravamos a compra acima — loga o erro mas não derruba o webhook (evita a
    // Hotmart ficar reenviando indefinidamente por um erro só na parte da conta).
    console.error("hotmart-webhook: erro ao processar conta:", e.message);
  }

  return new Response("OK", { status: 200 });
}
