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
  // O projeto Supabase é compartilhado com a 123DEVS: as tabelas da Bíblia
  // ficam no schema "biblia". Na API REST, o schema vai nestes cabeçalhos.
  const schema = path.startsWith("/rest/v1") ? { "Accept-Profile": "biblia", "Content-Profile": "biblia" } : {};
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...schema,
      ...(init.headers ?? {}),
    },
  });
}

/** Conta do Auth com este e-mail (Auth compartilhado: pode ser de outro produto). */
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const res = await supabaseAdminRequest("/rest/v1/rpc/user_id_by_email", { method: "POST", body: JSON.stringify({ p_email: email }) });
  if (!res.ok) return null;
  return ((await res.json()) as string | null) ?? null;
}

/** Cria perfil e status da conta na Bíblia (idempotente). */
async function createBibliaAccount(userId: string, email: string): Promise<void> {
  const [profileRes, statusRes] = await Promise.all([
    // O trigger já cria o perfil de contas convidadas com app=biblia; aqui é só
    // garantia (ignora se já existir).
    supabaseAdminRequest("/rest/v1/profiles?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({ id: userId, church_name: "" }),
    }),
    supabaseAdminRequest("/rest/v1/account_status?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: userId, email, role: "user", is_active: true }),
    }),
  ]);
  // Sem isto, um erro aqui (ex.: coluna renomeada, constraint nova) deixava
  // o usuário convidado sem account_status — ele clica no link, define a
  // senha, e cai num app que trata a conta como inativa/inexistente, sem
  // nenhum rastro no log do porquê.
  if (!profileRes.ok) console.error("hotmart-webhook: criação de profile falhou", profileRes.status, await profileRes.text());
  if (!statusRes.ok) console.error("hotmart-webhook: criação de account_status falhou", statusRes.status, await statusRes.text());
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
    // app=biblia: o modelo de e-mail do Supabase (compartilhado com a 123DEVS)
    // mostra a marca da Bíblia, e o trigger cria o perfil da Bíblia.
    body: JSON.stringify({ email, data: { app: "biblia" } }),
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

async function upsertPurchase(transactionId: string, email: string, product: string | null, status: string, affiliateCode: string | null) {
  await supabaseAdminRequest("/rest/v1/purchases?on_conflict=hotmart_transaction_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ hotmart_transaction_id: transactionId, email, product, status, hotmart_affiliate_code: affiliateCode }),
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
  // No payload v2.0.0 da Hotmart (o formato atual da API), o afiliado vem em
  // "data.affiliates": um array de { affiliate_code, name } — não em
  // "data.affiliation" nem solto na raiz. Mantemos os outros caminhos como
  // fallback pro formato de postback clássico, mas o de cima é o que bate com
  // a documentação oficial; se uma venda de afiliado não for atribuída, o
  // primeiro lugar a olhar é se este payload real tem "data.affiliates".
  const affiliateCode: string | null = (
    body.data?.affiliates?.[0]?.affiliate_code ??
    body.affiliation_code ??
    body.affiliate_code ??
    body.data?.purchase?.affiliate_code ??
    body.data?.affiliation?.code ??
    null
  )?.toString() ?? null;

  if (!email || !transactionId) {
    return new Response("Missing required fields (email/transaction)", { status: 400 });
  }

  // Idempotência primeiro: a Hotmart reenvia o webhook se não receber 200 rápido, e o
  // registro de compra não pode duplicar efeito — upsert por transaction_id resolve isso
  // independente do resultado do resto do handler.
  await upsertPurchase(transactionId, email, product, status || event || "unknown", affiliateCode);
  if (affiliateCode) {
    const assignRes = await supabaseAdminRequest("/rest/v1/rpc/assign_purchase_to_seller", {
      method: "POST", body: JSON.stringify({ p_transaction_id: transactionId, p_affiliate_code: affiliateCode }),
    });
    if (!assignRes.ok) {
      // Não interrompe o fluxo (a compra e o acesso do comprador não dependem
      // disso), mas sem este log uma venda de afiliado não atribuída falha
      // 100% em silêncio — nada no banco indica que a tentativa aconteceu.
      console.error("hotmart-webhook: assign_purchase_to_seller falhou", assignRes.status, await assignRes.text());
    }
  } else if (event === "PURCHASE_APPROVED" || APPROVED.has(status)) {
    // Só loga em compra aprovada — evita ruído em eventos que legitimamente não
    // têm afiliado (venda direta, sem link de afiliado).
    console.log("hotmart-webhook: compra aprovada sem affiliate_code no payload (evento:", event ?? status, ")");
  }

  const isApproved = event === "PURCHASE_APPROVED" || event === "PURCHASE_COMPLETE" || APPROVED.has(status);
  const isRevoked =
    event === "PURCHASE_REFUNDED" || event === "PURCHASE_CANCELED" || event === "PURCHASE_CHARGEBACK" || REVOKED.has(status);

  try {
    if (isApproved) {
      const { userId, alreadyExists } = await inviteUser(email);
      if (userId) {
        // Conta nova — cria profiles + account_status (service-role ignora RLS).
        await createBibliaAccount(userId, email);
      } else if (alreadyExists) {
        // Recompra ou reativação — só garante acesso, sem duplicar conta.
        const existingId = await findAccountIdByEmail(email);
        if (existingId) {
          await setActive(existingId, true);
        } else {
          // O Auth é compartilhado: a pessoa já tem conta em outro produto
          // (123DEVS, Glosa Zero...), mas ainda não na Bíblia. Libera com a
          // mesma conta — ela entra com a senha que já usa.
          const authId = await findAuthUserIdByEmail(email);
          if (authId) await createBibliaAccount(authId, email);
          else console.error("hotmart-webhook: e-mail já registrado, mas conta não encontrada");
        }
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
