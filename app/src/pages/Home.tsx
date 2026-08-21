import { useEffect, useState, ElementType, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenText, MusicNotes, Broadcast, MagnifyingGlass, ArrowUpRight } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { getRecent, formatRelative, RecentItem, RecentType } from "../lib/recent";
import { getBibleEntryPath } from "../lib/lastChapter";
import { getHymnEntryPath } from "../lib/lastHymn";

const RECENT_ICONS: Record<RecentType, ElementType> = {
  verse: BookOpenText,
  hymn: MusicNotes,
  presentation: BookOpenText,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

// Mesmo glow colorido roxo/laranja/verde da página de vendas e do app desktop.
const TINTS = { purple: "#8257e5", orange: "#f97316", green: "#20b381" } as const;

export default function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { books, profile } = useApp();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => setRecent(getRecent()), []);

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border shadow-sm";
  const surfaceClass = theme === "dark" ? "bg-dark-surface border-dark-border" : "bg-light-surface border-light-border";
  const rowClass = theme === "dark" ? "bg-dark-card2" : "bg-light-card2";
  const badgeClass = theme === "dark" ? "bg-primary-soft text-primary-light" : "bg-primary/10 text-primary";

  const handleQuickSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const cards = [
    { id: "bible", icon: BookOpenText, title: "Bíblia", description: "Ler e apresentar versículos", action: () => navigate(getBibleEntryPath(books.length > 0)), tint: "purple" as const },
    { id: "hymns", icon: MusicNotes, title: "Harpa Cristã", description: "640 hinos · nº ou palavra", action: () => navigate(getHymnEntryPath()), tint: "orange" as const },
    { id: "launcher", icon: Broadcast, title: "Ao vivo — buscar e apresentar", description: "Início rápido de qualquer conteúdo", action: () => navigate("/launcher"), tint: "green" as const },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-7">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight mb-1">{getGreeting()}, {profile?.church_name || "Bem-vindo(a)"}</h1>
            <p className={`text-sm ${mutedClass}`}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 w-full sm:w-[320px] ${surfaceClass}`}>
            <MagnifyingGlass size={16} className={`${mutedClass} shrink-0`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
              placeholder="Buscar versículo, hino…"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:opacity-60 truncate"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {cards.map((item) => {
            const Icon = item.icon;
            const tintColor = TINTS[item.tint];
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`group relative text-left rounded-2xl border p-4 flex flex-col gap-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${cardClass} hover:border-[var(--tint)]`}
                style={{ "--tint": tintColor } as CSSProperties}
              >
                <div className="relative w-[42px] h-[42px] shrink-0">
                  <div className="absolute inset-0 scale-150 rounded-full blur-lg opacity-30" style={{ background: tintColor }} />
                  <div className="relative w-full h-full rounded-xl grid place-items-center border" style={{ background: `${tintColor}1f`, borderColor: `${tintColor}4d`, color: tintColor }}>
                    <Icon size={21} />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-[15px]">{item.title}</div>
                  <div className={`text-xs mt-0.5 ${mutedClass}`}>{item.description}</div>
                </div>
                <ArrowUpRight size={15} className={`absolute top-4 right-4 transition-opacity opacity-0 group-hover:opacity-100 ${mutedClass}`} />
              </button>
            );
          })}
        </div>

        <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${cardClass}`}>
          <h2 className="font-bold text-sm">Continuar de onde parou</h2>
          {recent.length === 0 ? (
            <p className={`text-sm ${mutedClass}`}>O que você abrir para apresentar vai aparecer aqui.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((item) => {
                const Icon = RECENT_ICONS[item.type];
                return (
                  <button key={item.id} onClick={() => navigate(item.href)} className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition hover:opacity-80 ${rowClass}`}>
                    <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${badgeClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13.5px] truncate">{item.title}</div>
                      <div className={`text-[11.5px] ${mutedClass}`}>{item.subtitle} · {formatRelative(item.timestamp)}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ${badgeClass}`}>Abrir</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
