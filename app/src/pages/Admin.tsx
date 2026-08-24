import { FormEvent, useEffect, useState } from "react";
import { CheckCircle, XCircle, Users, ShoppingCart, TrendUp, UserPlus, X } from "@phosphor-icons/react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

interface Metrics {
  total_purchases: number;
  approved_purchases: number;
  active_accounts: number;
  inactive_accounts: number;
  purchases_last_30d: number;
}

interface Account {
  id: string;
  church_name: string;
  email: string | null;
  created_at: string;
  is_active: boolean;
  role: string;
  session_device_label: string | null;
  session_claimed_at: string | null;
}

interface Purchase {
  id: string;
  email: string;
  product: string | null;
  status: string;
  hotmart_transaction_id: string;
  created_at: string;
}
interface Seller { id: string; display_name: string; email: string | null; is_active: boolean; created_at: string; links: number; leads: number; approved_sales: number; }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Admin() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [tab, setTab] = useState<"accounts" | "purchases" | "sellers">("accounts");
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerFormError, setSellerFormError] = useState("");
  const [sellerSubmitting, setSellerSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    const [m, a, p, s] = await Promise.all([
      supabase.rpc("admin_metrics"),
      supabase.rpc("admin_list_accounts"),
      supabase.rpc("admin_list_purchases"),
      supabase.rpc("admin_list_sellers"),
    ]);

    if (m.error || !m.data?.ok) { setError(m.data?.error ?? m.error?.message ?? "Erro ao carregar métricas."); setLoading(false); return; }
    if (a.error || !a.data?.ok) { setError(a.data?.error ?? a.error?.message ?? "Erro ao carregar contas."); setLoading(false); return; }
    if (p.error || !p.data?.ok) { setError(p.data?.error ?? p.error?.message ?? "Erro ao carregar vendas."); setLoading(false); return; }
    if (s.error || !s.data?.ok) { setError(s.data?.error ?? s.error?.message ?? "Erro ao carregar vendedores."); setLoading(false); return; }

    setMetrics(m.data as Metrics);
    setAccounts(a.data.accounts as Account[]);
    setPurchases(p.data.purchases as Purchase[]);
    setSellers(s.data.sellers as Seller[]);
    setLoading(false);
  };

  const toggleSeller = async (id: string) => {
    const { data, error: err } = await supabase.rpc("admin_toggle_seller_active", { p_seller_id: id });
    if (!err && data?.ok) setSellers((all) => all.map((seller) => seller.id === id ? { ...seller, is_active: data.is_active } : seller));
  };

  const openSellerModal = () => {
    setSellerName("");
    setSellerEmail("");
    setSellerFormError("");
    setShowSellerModal(true);
  };

  const createSeller = async (event: FormEvent) => {
    event.preventDefault();
    const name = sellerName.trim();
    const email = sellerEmail.trim().toLowerCase();
    if (!name || !email) return;
    setSellerSubmitting(true);
    setSellerFormError("");
    const { data, error: invokeError } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>("admin-create-seller", {
      body: { name, email },
    });
    setSellerSubmitting(false);
    if (invokeError || !data?.ok) {
      const response = (invokeError as { context?: unknown } | null)?.context;
      const remoteError = response instanceof Response ? await response.clone().json().catch(() => null) as { error?: string } | null : null;
      setSellerFormError(data?.error ?? remoteError?.error ?? invokeError?.message ?? "Não foi possível criar o vendedor.");
      return;
    }
    setShowSellerModal(false);
    void load();
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, is_active: !acc.is_active } : acc)));
    const { data, error: err } = await supabase.rpc("admin_toggle_active", { p_user_id: id });
    if (err || !data?.ok) {
      // reverte se falhar
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, is_active: !acc.is_active } : acc)));
    }
  };

  const releaseAccountSession = async (id: string) => {
    const prevAccounts = accounts;
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, session_device_label: null, session_claimed_at: null } : acc)));
    const { data, error: err } = await supabase.rpc("admin_release_session", { p_user_id: id });
    if (err || !data?.ok) {
      // reverte se falhar
      setAccounts(prevAccounts);
    }
  };

  const bgClass = theme === "dark" ? "bg-dark-bg text-dark-text-primary" : "bg-light-bg text-light-text-primary";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";
  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const rowBorder = theme === "dark" ? "border-dark-border" : "border-light-border";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";

  if (loading) return <div className={`flex-1 flex items-center justify-center ${bgClass}`}><p className={mutedClass}>Carregando...</p></div>;

  if (error) {
    return (
      <div className={`flex-1 flex items-center justify-center p-6 ${bgClass}`}>
        <div className="text-center">
          <p className="text-danger text-sm mb-2">{error}</p>
          <p className={`text-xs ${mutedClass}`}>Sua conta precisa ter role = 'admin' em account_status.</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Vendas aprovadas", value: metrics?.approved_purchases ?? 0, icon: ShoppingCart, tint: "#7a1622" },
    { label: "Vendas nos últimos 30 dias", value: metrics?.purchases_last_30d ?? 0, icon: TrendUp, tint: "#f97316" },
    { label: "Contas ativas", value: metrics?.active_accounts ?? 0, icon: Users, tint: "#20b381" },
    { label: "Contas inativas", value: metrics?.inactive_accounts ?? 0, icon: XCircle, tint: "#ef4463" },
  ];

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto px-8 py-8 ${bgClass}`}>
      <div className="max-w-5xl mx-auto flex flex-col gap-7">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight mb-1">Painel de controle</h1>
          <p className={`text-sm ${mutedClass}`}>Vendas, contas e métricas da Bíblia Verbo</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={`rounded-2xl border p-4 flex flex-col gap-3 ${cardClass}`}>
                <div className="relative w-[38px] h-[38px]">
                  <div className="absolute inset-0 scale-150 rounded-full blur-lg opacity-25" style={{ background: c.tint }} />
                  <div className="relative w-full h-full rounded-xl grid place-items-center border" style={{ background: `${c.tint}1f`, borderColor: `${c.tint}4d`, color: c.tint }}>
                    <Icon size={19} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{c.value}</div>
                  <div className={`text-xs ${mutedClass}`}>{c.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab("accounts")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "accounts" ? "bg-primary text-white" : chipClass}`}>
            Contas ({accounts.length})
          </button>
          <button onClick={() => setTab("purchases")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "purchases" ? "bg-primary text-white" : chipClass}`}>
            Vendas ({purchases.length})
          </button>
          <button onClick={() => setTab("sellers")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "sellers" ? "bg-primary text-white" : chipClass}`}>
            Vendedores ({sellers.length})
          </button>
        </div>

        {tab === "accounts" && (
          <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${rowBorder} text-left ${mutedClass}`}>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">E-mail</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Criada em</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Papel</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Sessão</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 && (
                  <tr><td colSpan={6} className={`px-4 py-8 text-center ${mutedClass}`}>Nenhuma conta ainda.</td></tr>
                )}
                {accounts.map((acc) => (
                  <tr key={acc.id} className={`border-b ${rowBorder} last:border-0`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{acc.email || <span className={mutedClass}>Sem e-mail</span>}</div>
                      <div className={`text-xs ${mutedClass}`}>{acc.church_name || "Sem nome de igreja"}</div>
                    </td>
                    <td className={`px-4 py-3 ${mutedClass}`}>{fmtDate(acc.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${acc.role === "admin" ? "bg-primary/15 text-primary-light" : `${chipClass}`}`}>{acc.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${acc.is_active ? "text-success" : "text-danger"}`}>
                        {acc.is_active ? <CheckCircle size={13} weight="fill" /> : <XCircle size={13} weight="fill" />}
                        {acc.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${mutedClass}`}>
                      {acc.session_device_label ? (
                        <>
                          {acc.session_device_label}
                          {acc.session_claimed_at && <><br />{fmtDate(acc.session_claimed_at)}</>}
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => toggleActive(acc.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chipClass}`}>
                        {acc.is_active ? "Desativar" : "Reativar"}
                      </button>
                      {acc.session_device_label && (
                        <button onClick={() => releaseAccountSession(acc.id)} className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chipClass}`}>
                          Encerrar sessão
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "purchases" && (
          <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${rowBorder} text-left ${mutedClass}`}>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">E-mail</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Produto</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Transação</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 && (
                  <tr><td colSpan={5} className={`px-4 py-8 text-center ${mutedClass}`}>Nenhuma venda registrada ainda.</td></tr>
                )}
                {purchases.map((p) => (
                  <tr key={p.id} className={`border-b ${rowBorder} last:border-0`}>
                    <td className="px-4 py-3 font-medium">{p.email}</td>
                    <td className={`px-4 py-3 ${mutedClass}`}>{p.product ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.status === "approved" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>{p.status}</span>
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs ${mutedClass}`}>{p.hotmart_transaction_id}</td>
                    <td className={`px-4 py-3 ${mutedClass}`}>{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "sellers" && (
          <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
            <div className={`flex items-center justify-between border-b px-4 py-3 ${rowBorder}`}><p className="font-semibold">Equipe de vendas</p><button onClick={openSellerModal} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"><UserPlus size={15} />Cadastrar vendedor</button></div>
            <table className="w-full text-sm"><thead><tr className={`border-b ${rowBorder} text-left ${mutedClass}`}><th className="px-4 py-3 text-xs uppercase">Vendedor</th><th className="px-4 py-3 text-xs uppercase">Links</th><th className="px-4 py-3 text-xs uppercase">Leads</th><th className="px-4 py-3 text-xs uppercase">Vendas</th><th className="px-4 py-3 text-xs uppercase">Status</th><th /></tr></thead><tbody>
              {sellers.length === 0 && <tr><td colSpan={6} className={`px-4 py-8 text-center ${mutedClass}`}>Nenhum vendedor cadastrado.</td></tr>}
              {sellers.map((seller) => <tr key={seller.id} className={`border-b last:border-0 ${rowBorder}`}><td className="px-4 py-3"><p className="font-medium">{seller.display_name}</p><p className={`text-xs ${mutedClass}`}>{seller.email}</p></td><td className="px-4 py-3">{seller.links}</td><td className="px-4 py-3">{seller.leads}</td><td className="px-4 py-3">{seller.approved_sales}</td><td className={`px-4 py-3 text-xs font-semibold ${seller.is_active ? "text-success" : "text-danger"}`}>{seller.is_active ? "Ativo" : "Inativo"}</td><td className="px-4 py-3 text-right"><button onClick={() => void toggleSeller(seller.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${chipClass}`}>{seller.is_active ? "Inativar" : "Ativar"}</button></td></tr>)}
            </tbody></table>
          </div>
        )}
      </div>

      {showSellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="seller-modal-title">
          <form onSubmit={createSeller} className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${cardClass}`}>
            <button type="button" onClick={() => setShowSellerModal(false)} className={`absolute right-4 top-4 rounded-lg p-2 ${chipClass}`} aria-label="Fechar"><X size={18} /></button>
            <div className="mb-6 pr-8">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary-light"><UserPlus size={20} /></div>
              <h2 id="seller-modal-title" className="text-xl font-bold">Cadastrar vendedor</h2>
              <p className={`mt-1 text-sm ${mutedClass}`}>A pessoa confirmará o e-mail e criará a própria senha antes de acessar o painel.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="seller-name" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${mutedClass}`}>Nome completo</label>
                <input id="seller-name" required autoFocus value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Ex.: Ana Souza" className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus:border-primary ${theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border"}`} />
              </div>
              <div>
                <label htmlFor="seller-email" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${mutedClass}`}>E-mail de acesso</label>
                <input id="seller-email" required type="email" autoComplete="email" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} placeholder="ana@exemplo.com" className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus:border-primary ${theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border"}`} />
              </div>
            </div>

            {sellerFormError && <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">{sellerFormError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSellerModal(false)} disabled={sellerSubmitting} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${chipClass}`}>Cancelar</button>
              <button type="submit" disabled={!sellerName.trim() || !sellerEmail.trim() || sellerSubmitting} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{sellerSubmitting ? "Enviando confirmação..." : "Criar e enviar acesso"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
