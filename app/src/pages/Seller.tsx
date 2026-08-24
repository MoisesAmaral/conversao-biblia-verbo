import { FormEvent, useEffect, useState } from "react";
import { LinkSimple, Users, ShoppingCart, TrendUp, Plus, Trash } from "@phosphor-icons/react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";

interface Dashboard { links: number; leads: number; new_leads: number; approved_sales: number; sales_last_30d: number; }
interface AffiliateLink { id: string; name: string; hotmart_url: string; affiliate_code: string; is_active: boolean; }
interface Lead { id: string; name: string; email: string | null; phone: string | null; source: string | null; status: string; created_at: string; }

const emptyDashboard: Dashboard = { links: 0, leads: 0, new_leads: 0, approved_sales: 0, sales_last_30d: 0 };

export default function Seller() {
  const { theme } = useTheme();
  const { isSeller } = useApp();
  const [dashboard, setDashboard] = useState<Dashboard>(emptyDashboard);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState({ name: "", hotmart_url: "", affiliate_code: "" });
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", source: "" });

  const load = async () => {
    const [summary, linkRows, leadRows] = await Promise.all([
      supabase.rpc("seller_dashboard"),
      supabase.from("affiliate_links").select("*").order("created_at", { ascending: false }),
      supabase.from("seller_leads").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (summary.error || !summary.data?.ok) { setError(summary.data?.error ?? summary.error?.message ?? "Não foi possível carregar seu painel."); return; }
    setDashboard(summary.data as Dashboard);
    setLinks((linkRows.data ?? []) as AffiliateLink[]);
    setLeads((leadRows.data ?? []) as Lead[]);
  };

  useEffect(() => { if (isSeller) void load(); }, [isSeller]);

  const submitLink = async (event: FormEvent) => {
    event.preventDefault();
    const { error: err } = await supabase.from("affiliate_links").insert(newLink);
    if (err) { setError(err.message.includes("duplicate") ? "Este código de afiliado já foi cadastrado." : err.message); return; }
    setNewLink({ name: "", hotmart_url: "", affiliate_code: "" });
    void load();
  };
  const submitLead = async (event: FormEvent) => {
    event.preventDefault();
    const { error: err } = await supabase.from("seller_leads").insert(newLead);
    if (err) { setError(err.message); return; }
    setNewLead({ name: "", email: "", phone: "", source: "" });
    void load();
  };
  const deleteLink = async (id: string) => { await supabase.from("affiliate_links").delete().eq("id", id); void load(); };
  const setLeadStatus = async (id: string, status: string) => { await supabase.from("seller_leads").update({ status }).eq("id", id); void load(); };

  const bg = theme === "dark" ? "bg-dark-bg text-dark-text-primary" : "bg-light-bg text-light-text-primary";
  const card = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";
  const muted = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const field = theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border";
  if (!isSeller) return <div className={`flex-1 grid place-items-center ${bg}`}><p className={muted}>Este painel é exclusivo para vendedores.</p></div>;

  const cards = [
    ["Vendas aprovadas", dashboard.approved_sales, ShoppingCart], ["Vendas em 30 dias", dashboard.sales_last_30d, TrendUp],
    ["Leads", dashboard.leads, Users], ["Leads novos", dashboard.new_leads, Users],
  ] as const;
  return <div className={`flex-1 min-h-0 overflow-y-auto px-5 py-7 sm:px-8 ${bg}`}>
    <div className="mx-auto max-w-6xl space-y-7">
      <div><h1 className="text-[26px] font-bold">Painel do vendedor</h1><p className={`text-sm ${muted}`}>Acompanhe seus links, leads e vendas atribuídas pela Hotmart.</p></div>
      {error && <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className={`rounded-2xl border p-4 ${card}`}><Icon size={19} className="text-primary-light" /><div className="mt-3 text-2xl font-bold">{value}</div><div className={`text-xs ${muted}`}>{label}</div></div>)}</div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`rounded-2xl border p-5 ${card}`}><h2 className="font-bold">Novo link de afiliado</h2><form onSubmit={submitLink} className="mt-4 space-y-3">
          <input required placeholder="Nome da campanha" value={newLink.name} onChange={e => setNewLink({ ...newLink, name: e.target.value })} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${field}`} />
          <input required type="url" placeholder="Link da Hotmart" value={newLink.hotmart_url} onChange={e => setNewLink({ ...newLink, hotmart_url: e.target.value })} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${field}`} />
          <input required placeholder="Código de afiliado recebido da Hotmart" value={newLink.affiliate_code} onChange={e => setNewLink({ ...newLink, affiliate_code: e.target.value.trim() })} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${field}`} />
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Cadastrar link</button>
        </form></section>
        <section className={`rounded-2xl border p-5 ${card}`}><h2 className="font-bold">Cadastrar lead</h2><form onSubmit={submitLead} className="mt-4 space-y-3">
          <input required placeholder="Nome" value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${field}`} />
          <div className="grid grid-cols-2 gap-3"><input type="email" placeholder="E-mail" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} className={`min-w-0 rounded-xl border px-3 py-2.5 text-sm outline-none ${field}`} /><input placeholder="Telefone" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} className={`min-w-0 rounded-xl border px-3 py-2.5 text-sm outline-none ${field}`} /></div>
          <input placeholder="Origem (Instagram, indicação...)" value={newLead.source} onChange={e => setNewLead({ ...newLead, source: e.target.value })} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${field}`} />
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Cadastrar lead</button>
        </form></section>
      </div>
      <section className={`rounded-2xl border overflow-hidden ${card}`}><div className="flex items-center gap-2 px-5 py-4"><LinkSimple size={18} className="text-primary-light" /><h2 className="font-bold">Meus links ({links.length})</h2></div>{links.length === 0 ? <p className={`px-5 pb-5 text-sm ${muted}`}>Cadastre seu primeiro link de afiliado.</p> : <div>{links.map(link => <div key={link.id} className="flex items-center justify-between border-t border-dark-border px-5 py-3"><div className="min-w-0"><p className="font-medium">{link.name}</p><p className={`truncate text-xs ${muted}`}>{link.affiliate_code} · {link.hotmart_url}</p></div><button onClick={() => void deleteLink(link.id)} title="Remover link" className="p-2 text-danger"><Trash size={17} /></button></div>)}</div>}</section>
      <section className={`rounded-2xl border overflow-hidden ${card}`}><div className="px-5 py-4"><h2 className="font-bold">Leads recentes</h2></div>{leads.length === 0 ? <p className={`px-5 pb-5 text-sm ${muted}`}>Nenhum lead cadastrado.</p> : <div>{leads.map(lead => <div key={lead.id} className="flex items-center justify-between gap-3 border-t border-dark-border px-5 py-3"><div><p className="font-medium">{lead.name}</p><p className={`text-xs ${muted}`}>{lead.email || lead.phone || lead.source || "Sem contato"}</p></div><select value={lead.status} onChange={e => void setLeadStatus(lead.id, e.target.value)} className={`rounded-lg border px-2 py-1.5 text-xs ${field}`}><option value="new">Novo</option><option value="contacted">Contatado</option><option value="qualified">Qualificado</option><option value="won">Ganho</option><option value="lost">Perdido</option></select></div>)}</div>}</section>
    </div>
  </div>;
}
