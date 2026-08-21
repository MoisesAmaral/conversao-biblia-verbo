import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, BookOpenText, MusicNotes, Play, Square, ImageSquare, Cross } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { parseReference } from "../lib/search";
import { fetchVerses } from "../lib/bible";
import { HYMNS, getHymnSlides, searchHymns } from "../lib/hymns";
import { getBibleEntryPath } from "../lib/lastChapter";
import { getHymnEntryPath } from "../lib/lastHymn";
import { addRecent } from "../lib/recent";
import { presentationBus } from "../lib/presentationBus";

type DetectedType = "reference" | "word" | "hymn" | "slide" | null;

interface PresentableItem {
  text: string;
  reference: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
}

export default function Launcher() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { books, currentVersion, presentationActive, openPresentation, closePresentation } = useApp();

  const [query, setQuery] = useState("");
  const [detected, setDetected] = useState<DetectedType>(null);
  const [preview, setPreview] = useState<PresentableItem | null>(null);
  const [program, setProgram] = useState<PresentableItem | null>(null);
  const [programMode, setProgramMode] = useState<"content" | "black" | "logo">("content");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setError("");
    setSearching(true);

    try {
      const ref = parseReference(q, books);
      if (ref && currentVersion) {
        const verses = await fetchVerses(ref.book.order_num, ref.chapter, currentVersion.id);
        const verse = ref.verse ? verses.find((v) => v.number === ref.verse) : verses[0];
        if (verse) {
          setDetected("reference");
          setPreview({ text: verse.text, reference: `${ref.book.name} ${ref.chapter}:${verse.number}`, bookName: ref.book.name, chapter: ref.chapter, verseNumber: verse.number });
          setSearching(false);
          return;
        }
      }

      if (/^\d+$/.test(q)) {
        const hymn = HYMNS.find((h) => h.number === parseInt(q, 10));
        if (hymn) {
          const first = getHymnSlides(hymn)[0];
          if (first) {
            setDetected("hymn");
            setPreview({ text: first.text, reference: first.label || `Hino ${hymn.number}`, bookName: hymn.title, chapter: 0, verseNumber: 0 });
            setSearching(false);
            return;
          }
        }
      }

      const hymnResults = searchHymns(q);
      if (hymnResults.length > 0) {
        const hymn = hymnResults[0];
        const first = getHymnSlides(hymn)[0];
        if (first) {
          setDetected("hymn");
          setPreview({ text: first.text, reference: first.label || `Hino ${hymn.number}`, bookName: hymn.title, chapter: 0, verseNumber: 0 });
          setSearching(false);
          return;
        }
      }

      setPreview(null);
      setDetected(null);
      setError("Nada encontrado. Tente uma referência (João 3:16) ou número de hino.");
    } finally {
      setSearching(false);
    }
  };

  const goLive = () => {
    if (!preview) return;
    presentationBus.sendVerse(preview);
    setProgram(preview);
    setProgramMode("content");
    addRecent({ id: `launcher-${Date.now()}`, type: detected === "hymn" ? "hymn" : "verse", title: preview.reference, subtitle: "Início rápido", href: "/launcher" });
  };

  const handleBlack = () => { presentationBus.sendCommand({ type: "black" }); setProgramMode("black"); };
  const handleClear = () => { presentationBus.sendCommand({ type: "clear" }); setProgramMode("logo"); };

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const faintClass = theme === "dark" ? "text-dark-text-muted/60" : "text-light-text-muted/60";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border hover:border-primary/50" : "bg-light-card border-light-border hover:border-primary/50 shadow-sm";
  const surfaceClass = theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border2";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const badgeClass = theme === "dark" ? "bg-primary-soft text-primary-light" : "bg-primary/10 text-primary";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const railBg = theme === "dark" ? "bg-dark-surface" : "bg-light-surface";

  const SCOPE_CHIPS: { key: DetectedType; label: string }[] = [
    { key: "reference", label: "Referência" },
    { key: "word", label: "Palavra" },
    { key: "hymn", label: "Hino" },
    { key: "slide", label: "Slide" },
  ];

  return (
    <div className="flex-1 min-h-0 flex">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 px-12 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center gap-6 max-w-xl mx-auto w-full py-10">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight mb-1.5">O que vamos apresentar?</h1>
            <p className={`text-sm ${mutedClass}`}>Digite uma referência, um número de hino ou o nome de um slide.</p>
          </div>

          <div className={`rounded-2xl border p-1.5 shadow-lg ${surfaceClass}`}>
            <div className="flex items-center gap-3 px-3.5 py-3">
              <MagnifyingGlass size={20} className="text-primary-light shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="João 3:16, 21, Chuvas de bênção…"
                className="flex-1 min-w-0 bg-transparent outline-none text-[16px]"
              />
              <span className={`shrink-0 font-mono text-[11px] px-2 py-1 rounded-md border ${theme === "dark" ? "border-dark-border2" : "border-light-border2"} ${faintClass}`}>Enter</span>
            </div>
            <div className="flex gap-1.5 px-2.5 pb-2">
              {SCOPE_CHIPS.map((c) => (
                <span key={c.key} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition ${detected === c.key ? "bg-primary/20 text-primary-light" : mutedClass}`}>{c.label}</span>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {preview && (
            <div className="rounded-xl border-2 border-primary/50 bg-black p-5">
              <p className="font-serif text-white text-[15px] leading-relaxed italic">"{preview.text}"</p>
              <p className="font-mono text-[11px] text-primary-light tracking-widest mt-2 uppercase">{preview.reference}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate(getBibleEntryPath(books.length > 0))} className={`flex-1 rounded-xl border p-3.5 flex items-center gap-2.5 transition ${cardClass}`}>
              <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${badgeClass}`}><BookOpenText size={18} /></div>
              <span className="font-semibold text-[13.5px]">Bíblia</span>
            </button>
            <button onClick={() => navigate(getHymnEntryPath())} className={`flex-1 rounded-xl border p-3.5 flex items-center gap-2.5 transition ${cardClass}`}>
              <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${badgeClass}`}><MusicNotes size={18} /></div>
              <span className="font-semibold text-[13.5px]">Harpa</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`w-[360px] shrink-0 border-l ${headerClass} ${railBg} p-4 flex flex-col gap-3.5`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-widest ${mutedClass}`}>Ao vivo</span>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${program ? "border-danger/50 text-danger" : `border-transparent ${mutedClass}`}`}>
            <span className={`w-[7px] h-[7px] rounded-full bg-current ${program ? "animate-pulse" : ""}`} />
            {program ? "No ar" : "Fechada"}
          </span>
        </div>

        <div>
          <p className={`text-[10px] font-bold tracking-widest mb-1.5 ${program ? "text-danger" : mutedClass}`}>PROGRAMA · TELA 2</p>
          <div className="aspect-video rounded-lg border-2 border-danger bg-black overflow-hidden flex flex-col items-center justify-center text-center p-4 relative">
            {programMode === "black" ? (
              <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Tela preta</p>
            ) : programMode === "logo" ? (
              <>
                <Cross size={20} className="text-white/40 mb-1.5" />
                <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Logo</p>
              </>
            ) : program ? (
              <>
                <p className="font-serif text-[13px] leading-snug text-white italic">"{program.text}"</p>
                <p className="font-mono text-[9px] text-danger tracking-widest mt-2 uppercase">{program.reference}</p>
              </>
            ) : (
              <p className="text-[11px] text-white/30">Nada no ar</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-widest mb-1.5 text-primary">PREVIEW · A SEGUIR</p>
          <div className="aspect-video rounded-lg border border-dashed border-primary/40 bg-black overflow-hidden flex flex-col items-center justify-center text-center p-4">
            {preview ? (
              <>
                <p className="font-serif text-[13px] leading-snug text-white/90 italic">"{preview.text}"</p>
                <p className="font-mono text-[9px] text-primary-light tracking-widest mt-2 uppercase">{preview.reference}</p>
              </>
            ) : (
              <p className="text-[11px] text-white/30">Busque algo à esquerda</p>
            )}
          </div>
        </div>

        <button onClick={goLive} disabled={!preview || searching} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold bg-danger text-white transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
          <Play size={16} weight="fill" />
          Ir ao ar
        </button>

        <div className="flex gap-2">
          <button onClick={handleBlack} className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${programMode === "black" ? "bg-danger text-white" : chipClass}`}>
            <Square size={14} weight="fill" />
            Preto
          </button>
          <button onClick={handleClear} className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${programMode === "logo" ? "bg-danger text-white" : chipClass}`}>
            <ImageSquare size={14} />
            Logo
          </button>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => (presentationActive ? closePresentation() : openPresentation())}
          className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${presentationActive ? "bg-success/20 text-success border border-success/30" : chipClass}`}
        >
          {presentationActive ? "Apresentação aberta" : "Abrir apresentação"}
        </button>
      </div>
    </div>
  );
}
