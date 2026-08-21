import { useEffect, useRef, useState, ElementType, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenText, MusicNotes, CardsThree, Folders as FoldersIcon, Broadcast, Monitor,
  MagnifyingGlass, ArrowUpRight, CaretUp, CaretDown, Plus, X, ListPlus, MicrophoneStage,
} from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { getRecent, formatRelative, RecentItem, RecentType } from "../lib/recent";
import { getServiceOrder, saveServiceOrder, ServiceOrderItem, ServiceItemType } from "../lib/serviceOrder";
import { getBibleEntryPath } from "../lib/lastChapter";
import { getHymnEntryPath } from "../lib/lastHymn";
import { setLiveQueue } from "../lib/liveQueue";
import { HYMNS } from "../lib/hymns";
import { parseReference } from "../lib/search";
import { getFolders, Folder } from "../lib/folders";

const ADD_TYPES: { key: ServiceItemType; label: string; icon: ElementType }[] = [
  { key: "hymn", label: "Hino", icon: MusicNotes },
  { key: "verse", label: "Versículo", icon: BookOpenText },
  { key: "presentation", label: "Apresentação", icon: CardsThree },
  { key: "message", label: "Mensagem", icon: MicrophoneStage },
];

const RECENT_ICONS: Record<RecentType, ElementType> = {
  verse: BookOpenText,
  hymn: MusicNotes,
  presentation: CardsThree,
};

const SERVICE_ICONS: Record<ServiceItemType, ElementType> = {
  hymn: MusicNotes,
  verse: BookOpenText,
  presentation: CardsThree,
  message: MicrophoneStage,
  other: ListPlus,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

// Rocketseat-style badge glow — três cores da marca alternando pelo grid.
const TINTS = { wine: "#7a1622", orange: "#f97316", green: "#20b381" } as const;

export default function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { books, profile, openPresentation } = useApp();

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [order, setOrder] = useState<ServiceOrderItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addType, setAddType] = useState<ServiceItemType>("hymn");
  const [addValue, setAddValue] = useState("");
  const [addPresRef, setAddPresRef] = useState("");
  const [addFolders, setAddFolders] = useState<Folder[]>([]);
  const [addError, setAddError] = useState("");
  const [queueMsg, setQueueMsg] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const addItemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(getRecent());
    setOrder(getServiceOrder());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const faintClass = theme === "dark" ? "text-dark-text-muted/70" : "text-light-text-muted/70";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border hover:border-primary/50" : "bg-light-card border-light-border hover:border-primary/50 shadow-sm";
  const surfaceClass = theme === "dark" ? "bg-dark-surface border-dark-border" : "bg-light-surface border-light-border";
  const rowClass = theme === "dark" ? "bg-dark-card2" : "bg-light-card2";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const badgeClass = theme === "dark" ? "bg-primary-soft text-primary-light" : "bg-primary/10 text-primary";
  const inputClass = theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border2";

  const handleQuickSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const persistOrder = (items: ServiceOrderItem[]) => {
    setOrder(items);
    saveServiceOrder(items);
  };

  const handleAddOrderItem = () => {
    setAddError("");

    if (addType === "hymn") {
      const num = parseInt(addValue, 10);
      const hymn = HYMNS.find((h) => h.number === num);
      if (!hymn) {
        setAddError("Hino não encontrado");
        return;
      }
      persistOrder([...order, { id: `item-${Date.now()}`, label: `Harpa ${hymn.number} — ${hymn.title}`, type: "hymn", ref: { kind: "hymn", number: hymn.number } }]);
    } else if (addType === "verse") {
      const ref = parseReference(addValue, books);
      if (!ref) {
        setAddError("Referência não reconhecida (ex: João 3:16)");
        return;
      }
      persistOrder([
        ...order,
        {
          id: `item-${Date.now()}`,
          label: `${ref.book.name} ${ref.chapter}${ref.verse ? `:${ref.verse}` : ""}`,
          type: "verse",
          ref: { kind: "verse", bookOrderNum: ref.book.order_num, chapter: ref.chapter, verse: ref.verse },
        },
      ]);
    } else if (addType === "presentation") {
      const [folderId, presId] = addPresRef.split("::");
      const folder = addFolders.find((f) => f.id === folderId);
      const pres = folder?.presentations.find((p) => p.id === presId);
      if (!folder || !pres) {
        setAddError("Escolha uma apresentação");
        return;
      }
      persistOrder([
        ...order,
        { id: `item-${Date.now()}`, label: `${folder.name} — ${pres.name}`, type: "presentation", ref: { kind: "presentation", folderId: folder.id, presentationId: pres.id } },
      ]);
    } else {
      if (!addValue.trim()) {
        setIsAddingItem(false);
        return;
      }
      persistOrder([...order, { id: `item-${Date.now()}`, label: addValue.trim(), type: addType }]);
    }

    setAddValue("");
    setAddPresRef("");
    setIsAddingItem(false);
  };

  const openAddItem = () => {
    setIsAddingItem(true);
    setAddError("");
    setTimeout(() => addItemInputRef.current?.focus(), 0);
  };

  const handleSelectAddType = (type: ServiceItemType) => {
    setAddType(type);
    setAddValue("");
    setAddError("");
    if (type === "presentation" && addFolders.length === 0) {
      getFolders().then(setAddFolders);
    }
    setTimeout(() => addItemInputRef.current?.focus(), 0);
  };

  const handleBuildLiveQueue = () => {
    const queueItems = order.filter((i) => i.ref).map((i) => ({ label: i.label, type: i.type, ref: i.ref! }));
    if (queueItems.length === 0) {
      setQueueMsg("Adicione um hino, versículo ou apresentação à ordem do culto primeiro.");
      setTimeout(() => setQueueMsg(""), 3500);
      return;
    }
    setLiveQueue(queueItems, 0);
    openPresentation();
    navigate("/live");
  };

  const handleRemoveOrderItem = (id: string) => {
    persistOrder(order.filter((i) => i.id !== id));
  };

  const handleMoveOrderItem = (index: number, dir: "up" | "down") => {
    const newIndex = dir === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;
    const next = [...order];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    persistOrder(next);
  };

  const cards = [
    { id: "bible", icon: BookOpenText, title: "Bíblia", description: "Ler e apresentar versículos", action: () => navigate(getBibleEntryPath(books.length > 0)), tint: "wine" as const },
    { id: "hymns", icon: MusicNotes, title: "Harpa Cristã", description: "640 hinos · nº ou palavra", action: () => navigate(getHymnEntryPath()), tint: "orange" as const },
    { id: "new-presentation", icon: CardsThree, title: "Nova apresentação", description: "Escolha um departamento", action: () => navigate("/folders"), tint: "green" as const },
    { id: "folders", icon: FoldersIcon, title: "Departamentos", description: "Louvor, Infantil, Jovens…", action: () => navigate("/folders"), tint: "green" as const },
    { id: "go-live", icon: Broadcast, title: "Iniciar projeção", description: "Abrir janela na Tela 2", action: openPresentation, tint: "wine" as const, highlight: true },
    { id: "screens", icon: Monitor, title: "Configurar telas", description: "Saída, tela cheia", action: () => navigate("/settings"), tint: "orange" as const },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-7">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight mb-1">{getGreeting()}, {profile?.church_name || "Bem-vindo(a)"}</h1>
            <p className={`text-sm ${mutedClass}`}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 w-full sm:w-[320px] ${surfaceClass}`}>
            <MagnifyingGlass size={16} className={`${mutedClass} shrink-0`} />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
              placeholder="Buscar versículo, hino…"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:opacity-60 truncate"
            />
            <span className={`shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded border ${theme === "dark" ? "border-dark-border2" : "border-light-border2"} ${faintClass}`}>Ctrl K</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
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
                    <Icon size={21} weight={item.highlight ? "fill" : "regular"} />
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

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
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

          <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${cardClass}`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">Ordem do culto</h2>
              <span className={`font-mono text-[11px] ${mutedClass}`}>{order.length} itens</span>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              {order.length === 0 ? (
                <p className={`text-sm ${mutedClass}`}>Monte a sequência do culto de hoje.</p>
              ) : (
                order.map((item, idx) => {
                  const Icon = SERVICE_ICONS[item.type];
                  return (
                    <div key={item.id} className="group flex items-center gap-2.5 text-[13px]">
                      <span className={`font-mono w-4 shrink-0 ${mutedClass}`}>{idx + 1}</span>
                      <Icon size={14} className="text-primary shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                        <button onClick={() => handleMoveOrderItem(idx, "up")} disabled={idx === 0} className={`w-6 h-6 grid place-items-center rounded transition disabled:opacity-30 ${chipClass}`}>
                          <CaretUp size={11} />
                        </button>
                        <button onClick={() => handleMoveOrderItem(idx, "down")} disabled={idx === order.length - 1} className={`w-6 h-6 grid place-items-center rounded transition disabled:opacity-30 ${chipClass}`}>
                          <CaretDown size={11} />
                        </button>
                        <button onClick={() => handleRemoveOrderItem(item.id)} className="w-6 h-6 grid place-items-center rounded transition text-danger hover:bg-danger/15">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {isAddingItem ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  {ADD_TYPES.map((t) => {
                    const TIcon = t.icon;
                    const active = addType === t.key;
                    return (
                      <button key={t.key} onClick={() => handleSelectAddType(t.key)} title={t.label} className={`flex-1 py-1.5 rounded-lg grid place-items-center transition ${active ? "bg-primary text-white" : chipClass}`}>
                        <TIcon size={14} />
                      </button>
                    );
                  })}
                </div>

                {addType === "presentation" ? (
                  <select value={addPresRef} onChange={(e) => setAddPresRef(e.target.value)} className={`w-full rounded-lg border px-2.5 py-2 outline-none text-xs ${inputClass}`}>
                    <option value="">Escolha uma apresentação…</option>
                    {addFolders.map((f) => (
                      <optgroup key={f.id} label={f.name}>
                        {f.presentations.map((p) => (
                          <option key={p.id} value={`${f.id}::${p.id}`}>{p.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 ${inputClass}`}>
                    <input
                      ref={addItemInputRef}
                      value={addValue}
                      onChange={(e) => setAddValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddOrderItem();
                        if (e.key === "Escape") setIsAddingItem(false);
                      }}
                      placeholder={addType === "hymn" ? "Número do hino (ex: 14)" : addType === "verse" ? "Ex: João 3:16" : "Ex: Palavra do Pr. André"}
                      className="flex-1 min-w-0 bg-transparent outline-none text-xs px-1.5 py-1"
                    />
                  </div>
                )}

                {addError && <p className="text-[11px] text-danger">{addError}</p>}

                <div className="flex gap-1.5">
                  <button onClick={() => setIsAddingItem(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${chipClass}`}>
                    Cancelar
                  </button>
                  <button onClick={handleAddOrderItem} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition">
                    Adicionar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={openAddItem}
                className={`flex items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-medium transition ${mutedClass} ${theme === "dark" ? "border-dark-border2 hover:border-primary/50" : "border-light-border2 hover:border-primary/50"}`}
              >
                <Plus size={12} weight="bold" />
                Adicionar item
              </button>
            )}

            {queueMsg && <p className="text-[11px] text-warning text-center">{queueMsg}</p>}
            <button onClick={handleBuildLiveQueue} className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition flex items-center justify-center gap-2">
              <ListPlus size={15} />
              Montar fila ao vivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
