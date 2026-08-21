import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Users, ShoppingCart, TrendUp } from "@phosphor-icons/react";
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
  created_at: string;
  is_active: boolean;
  role: string;
}

interface Purchase {
  id: string;
  email: string;
  product: string | null;
  status: string;
  hotmart_transaction_id: string;
  created_at: string;
}

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
  const [tab, setTab] = useState<"accounts" | "purchases">("accounts");

  const load = async () => {
    setLoading(true);
    setError("");
    const [m, a, p] = await Promise.all([
      supabase.rpc("admin_metrics"),
      supabase.rpc("admin_list_accounts"),
      supabase.rpc("admin_list_purchases"),
    ]);

    if (m.error || !m.data?.ok) { setError(m.data?.error ?? m.error?.message ?? "Erro ao carregar métricas."); setLoading(false); return; }
    if (a.error || !a.data?.ok) { setError(a.data?.error ?? a.error?.message ?? "Erro ao carregar contas."); setLoading(false); return; }
    if (p.error || !p.data?.ok) { setError(p.data?.error ?? p.error?.message ?? "Erro ao carregar vendas."); setLoading(false); return; }

    setMetrics(m.data as Metrics);
    setAccounts(a.data.accounts as Account[]);
    setPurchases(p.data.purchases as Purchase[]);
    setLoading(false);
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
    { label: "Vendas aprovadas", value: metrics?.approved_purchases ?? 0, icon: ShoppingCart, tint: "#8257e5" },
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
        </div>

        {tab === "accounts" && (
          <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${rowBorder} text-left ${mutedClass}`}>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Igreja</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Criada em</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Papel</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 && (
                  <tr><td colSpan={5} className={`px-4 py-8 text-center ${mutedClass}`}>Nenhuma conta ainda.</td></tr>
                )}
                {accounts.map((acc) => (
                  <tr key={acc.id} className={`border-b ${rowBorder} last:border-0`}>
                    <td className="px-4 py-3 font-medium">{acc.church_name || <span className={mutedClass}>Sem nome</span>}</td>
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
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleActive(acc.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chipClass}`}>
                        {acc.is_active ? "Desativar" : "Reativar"}
                      </button>
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
      </div>
    </div>
  );
}
