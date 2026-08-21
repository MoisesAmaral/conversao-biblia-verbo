import { ElementType, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MusicNotes, BookOpenText, CardsThree, ListPlus, SpinnerGap,
  CheckCircle, Eye, Clock, Broadcast, Play, CaretLeft, CaretRight, Square, ImageSquare, Cross,
} from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { getLiveQueue, updateLiveQueueIndex, clearLiveQueue } from "../lib/liveQueue";
import { resolveQueueItem, ResolvedQueueItem, ResolvedSlide } from "../lib/queueResolver";
import { ServiceItemType } from "../lib/serviceOrder";
import { addRecent } from "../lib/recent";
import { presentationBus } from "../lib/presentationBus";
import Dot from "../components/Dot";

const ITEM_ICONS: Record<ServiceItemType, ElementType> = {
  hymn: MusicNotes,
  verse: BookOpenText,
  presentation: CardsThree,
  message: ListPlus,
  other: ListPlus,
};

interface FlatSlot {
  itemIdx: number;
  slideIdx: number;
  slide: ResolvedSlide;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function LiveQueue() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { books, currentVersion, presentationActive, openPresentation, closePresentation } = useApp();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ResolvedQueueItem[]>([]);
  const [previewFlatIdx, setPreviewFlatIdx] = useState(0);
  const [programFlatIdx, setProgramFlatIdx] = useState<number | null>(null);
  const [programMode, setProgramMode] = useState<"content" | "black" | "logo">("content");
  const liveStartRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const queue = getLiveQueue();
    if (!queue || queue.items.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(queue.items.map((i) => resolveQueueItem(i, { books, currentVersion }))).then((resolved) => {
      setItems(resolved);
      setPreviewFlatIdx(Math.max(0, queue.index));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (programFlatIdx === null) return;
    if (liveStartRef.current === null) liveStartRef.current = Date.now();
    const interval = setInterval(() => setElapsed(Date.now() - (liveStartRef.current ?? Date.now())), 1000);
    return () => clearInterval(interval);
  }, [programFlatIdx]);

  const flat: FlatSlot[] = useMemo(() => {
    const out: FlatSlot[] = [];
    items.forEach((item, itemIdx) => {
      item.slides.forEach((slide, slideIdx) => out.push({ itemIdx, slideIdx, slide }));
    });
    return out;
  }, [items]);

  const clampedPreview = Math.min(previewFlatIdx, Math.max(0, flat.length - 1));
  const previewSlot = flat[clampedPreview];
  const programSlot = programFlatIdx !== null ? flat[programFlatIdx] : null;
  const activeItemIdx = previewSlot?.itemIdx ?? 0;

  const setPreview = (flatIdx: number) => {
    setPreviewFlatIdx(flatIdx);
    updateLiveQueueIndex(flatIdx);
  };

  const goLive = () => {
    if (!previewSlot) return;
    presentationBus.sendVerse(previewSlot.slide.presentData);
    setProgramFlatIdx(clampedPreview);
    setProgramMode("content");
    const item = items[previewSlot.itemIdx];
    if (item) {
      addRecent({
        id: `live-${previewSlot.itemIdx}`,
        type: item.type === "hymn" ? "hymn" : item.type === "presentation" ? "presentation" : "verse",
        title: item.label,
        subtitle: "Fila ao vivo",
        href: "/live",
      });
    }
  };

  const previewPrev = () => clampedPreview > 0 && setPreview(clampedPreview - 1);
  const previewNext = () => clampedPreview < flat.length - 1 && setPreview(clampedPreview + 1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        goLive();
      } else if (e.key === "ArrowLeft") {
        if (programFlatIdx !== null) presentationBus.requestNavigate("prev");
        else previewPrev();
      } else if (e.key === "ArrowRight") {
        if (programFlatIdx !== null) presentationBus.requestNavigate("next");
        else previewNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPreview, items, programFlatIdx]);

  // Setas apertadas na própria aba de apresentação (Tela 2) avançam o programa diretamente.
  useEffect(() => {
    return presentationBus.subscribe((msg) => {
      if (msg.type !== "verse-navigate") return;
      const base = programFlatIdx ?? clampedPreview;
      const newIdx = msg.dir === "next" ? Math.min(flat.length - 1, base + 1) : Math.max(0, base - 1);
      const slot = flat[newIdx];
      if (!slot) return;
      setPreview(newIdx);
      presentationBus.sendVerse(slot.slide.presentData);
      setProgramFlatIdx(newIdx);
      setProgramMode("content");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat, programFlatIdx, clampedPreview]);

  const handleExit = () => {
    clearLiveQueue();
    navigate("/");
  };

  const handleClear = () => { presentationBus.sendCommand({ type: "clear" }); setProgramMode("logo"); };
  const handleBlack = () => { presentationBus.sendCommand({ type: "black" }); setProgramMode("black"); };
  const handleOpenPresentation = () => (presentationActive ? closePresentation() : openPresentation());

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const faintClass = theme === "dark" ? "text-dark-text-muted/60" : "text-light-text-muted/60";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";
  const railBg = theme === "dark" ? "bg-dark-surface" : "bg-light-surface";

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center gap-2">
        <SpinnerGap size={18} className="animate-spin text-primary" />
        <span className={mutedClass}>Preparando a fila...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
        <p className="text-lg font-bold">Nenhuma fila ativa</p>
        <p className={`text-sm ${mutedClass}`}>Monte a ordem do culto na Início e clique em "Montar fila ao vivo".</p>
        <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition">
          Voltar à Início
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex">
      {/* ── Fila do culto ── */}
      <div className={`w-[280px] shrink-0 border-r ${headerClass} ${railBg} flex flex-col min-h-0`}>
        <div className={`px-4 py-3.5 border-b ${headerClass} flex items-center justify-between`}>
          <h1 className="font-bold text-sm">Fila do culto</h1>
          <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${chipClass}`}>{items.length}</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2">
          {items.map((item, itemIdx) => {
            const Icon = ITEM_ICONS[item.type];

            if (itemIdx !== activeItemIdx) {
              const done = itemIdx < activeItemIdx;
              return (
                <button
                  key={itemIdx}
                  onClick={() => {
                    const firstFlat = flat.findIndex((f) => f.itemIdx === itemIdx);
                    if (firstFlat >= 0) setPreview(firstFlat);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition ${done ? "opacity-50" : ""} ${theme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`}
                >
                  {done ? <CheckCircle size={15} weight="fill" className="text-success shrink-0" /> : <Icon size={15} className={`shrink-0 ${mutedClass}`} />}
                  <span className="text-[13px] truncate flex-1">{item.label}</span>
                </button>
              );
            }

            return (
              <div key={itemIdx} className="mb-1">
                {item.slides.length === 0 ? (
                  <div className="flex items-center gap-2.5 px-2.5 py-2">
                    <Icon size={15} className={`shrink-0 ${mutedClass}`} />
                    <span className={`text-[13px] ${mutedClass}`}>{item.label} — conteúdo não encontrado</span>
                  </div>
                ) : (
                  item.slides.map((slide, slideIdx) => {
                    const flatIdx = flat.findIndex((f) => f.itemIdx === itemIdx && f.slideIdx === slideIdx);
                    const isProgram = flatIdx === programFlatIdx && presentationActive;
                    const isPreview = flatIdx === clampedPreview;
                    return (
                      <button
                        key={slide.id}
                        onClick={() => setPreview(flatIdx)}
                        onDoubleClick={() => {
                          setPreview(flatIdx);
                          goLive();
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition mb-0.5 border ${
                          isProgram
                            ? "bg-danger/15 border-danger/50"
                            : isPreview
                              ? "bg-primary/15 border-primary/50"
                              : `border-transparent ${theme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`
                        }`}
                      >
                        {isProgram ? (
                          <Dot className="bg-danger animate-pulse shrink-0" />
                        ) : isPreview ? (
                          <Eye size={13} className="text-primary shrink-0" />
                        ) : (
                          <Icon size={14} className={`shrink-0 ${mutedClass}`} />
                        )}
                        <span className="text-[13px] font-medium truncate flex-1">{slide.label || item.label}</span>
                        {isProgram && <span className="text-[9px] font-bold uppercase tracking-wider text-danger shrink-0">No ar</span>}
                        {isPreview && !isProgram && <span className="text-[9px] font-bold uppercase tracking-wider text-primary shrink-0">Preview</span>}
                      </button>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
        <div className={`p-2.5 border-t ${headerClass}`}>
          <button onClick={handleExit} className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition ${chipClass}`}>
            <ArrowLeft size={13} />
            Sair da fila
          </button>
        </div>
      </div>

      {/* ── Monitores + transporte ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 px-6 py-5 gap-4">
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2">
              <Dot className="bg-primary" />
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase">Preview</span>
              <span className={`text-[11px] ${faintClass}`}>— a próxima cena</span>
            </div>
            <div className="flex-1 rounded-2xl border-2 border-primary bg-black overflow-hidden flex flex-col items-center justify-center text-center p-8 relative min-h-0">
              {previewSlot ? (
                <>
                  <p className="font-serif text-xl leading-relaxed text-white">"{previewSlot.slide.text}"</p>
                  <p className="font-mono text-[11px] text-primary-light tracking-widest absolute bottom-4">
                    {(previewSlot.slide.presentData.reference || "").toUpperCase()}
                  </p>
                </>
              ) : (
                <p className="text-white/30 text-sm">Selecione um item</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2">
              <Dot className={`bg-danger ${programMode !== "content" || programSlot ? "animate-pulse" : ""}`} />
              <span className="text-[11px] font-bold tracking-widest text-danger uppercase">Programa</span>
              <span className={`text-[11px] ${faintClass}`}>— na Tela 2 agora</span>
            </div>
            <div className="flex-1 rounded-2xl border-2 border-danger bg-black overflow-hidden flex flex-col items-center justify-center text-center p-8 relative min-h-0">
              {programMode === "black" ? (
                <p className="font-mono text-xs text-white/40 tracking-widest uppercase">Tela preta</p>
              ) : programMode === "logo" ? (
                <>
                  <Cross size={28} className="text-white/40 mb-2" />
                  <p className="font-mono text-xs text-white/40 tracking-widest uppercase">Logo</p>
                </>
              ) : programSlot ? (
                <>
                  <p className="font-serif text-xl leading-relaxed text-white">"{programSlot.slide.text}"</p>
                  <p className="font-mono text-[11px] text-danger tracking-widest absolute bottom-4">
                    {(programSlot.slide.presentData.reference || "").toUpperCase()}
                  </p>
                </>
              ) : (
                <p className="text-white/30 text-sm">Nada no ar</p>
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-3.5 flex items-center gap-3 shrink-0 ${cardClass}`}>
          <button
            onClick={goLive}
            disabled={!previewSlot}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-danger text-white transition hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={16} weight="fill" />
            Ir ao ar
            <span className="text-[10px] font-mono opacity-80">Espaço</span>
          </button>
          <div className={`w-px h-8 ${theme === "dark" ? "bg-dark-border" : "bg-light-border"}`} />
          <button
            onClick={previewPrev}
            disabled={clampedPreview === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${chipClass} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <CaretLeft size={14} />
            Anterior
          </button>
          <button
            onClick={previewNext}
            disabled={clampedPreview >= flat.length - 1}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${chipClass} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Próximo
            <CaretRight size={14} />
          </button>
          <div className="flex-1" />
          <button
            onClick={handleBlack}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${programMode === "black" ? "bg-danger text-white" : chipClass}`}
          >
            <Square size={14} weight="fill" />
            Tela preta
          </button>
          <button
            onClick={handleClear}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${programMode === "logo" ? "bg-danger text-white" : chipClass}`}
          >
            <ImageSquare size={14} />
            Logo
          </button>
        </div>
      </div>

      {/* ── Saída ── */}
      <div className={`w-[230px] shrink-0 border-l ${headerClass} ${railBg} p-4 flex flex-col gap-3.5`}>
        <span className={`text-[11px] font-bold uppercase tracking-widest ${mutedClass}`}>Tela 2</span>

        <div className={`rounded-xl border p-3 ${cardClass}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">Janela de apresentação</span>
            <Dot className={presentationActive ? "bg-danger animate-pulse" : mutedClass} />
          </div>
          <div className="aspect-video rounded-lg bg-black flex items-center justify-center p-2 text-center">
            {!presentationActive ? (
              <span className="text-[8px] text-white/30">Fechada</span>
            ) : programMode === "black" ? (
              <span className="text-[8px] text-white/30 uppercase tracking-widest">Preto</span>
            ) : programMode === "logo" ? (
              <Cross size={14} className="text-white/30" />
            ) : programSlot ? (
              <p className="font-serif text-[8px] text-white/90 leading-tight line-clamp-3">"{programSlot.slide.text}"</p>
            ) : (
              <span className="text-[8px] text-white/30">Sem sinal</span>
            )}
          </div>
          <button
            onClick={handleOpenPresentation}
            className={`w-full mt-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              presentationActive ? "bg-success/20 text-success border border-success/30" : "bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            <Broadcast size={13} weight={presentationActive ? "fill" : "regular"} />
            {presentationActive ? "Aberta" : "Abrir apresentação"}
          </button>
        </div>

        <div className="flex-1" />

        {programFlatIdx !== null && (
          <div className={`flex items-center gap-2 text-[11px] pt-3 border-t ${headerClass} ${mutedClass}`}>
            <Clock size={13} />
            Ao vivo há {formatElapsed(elapsed)}
          </div>
        )}
      </div>
    </div>
  );
}
