import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Broadcast, MagnifyingGlass } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { HYMNS, getHymnSlides, searchHymns, Hymn } from "../lib/hymns";
import { setLastHymn } from "../lib/lastHymn";
import { PresenterPanel } from "../components/PresenterPanel";
import { usePresentableList } from "../hooks/usePresentableList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { addRecent } from "../lib/recent";
import { presentationBus } from "../lib/presentationBus";
import { Slide } from "../types";

type ThemeKey = "dark" | "light" | "blue" | "sepia";

export default function HymnDetail() {
  const { number } = useParams<{ number: string }>();
  const { theme: appTheme } = useTheme();
  const navigate = useNavigate();
  const { presentationActive, openPresentation: openPresentationWindow, closePresentation, toggleFullscreen } = useApp();

  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [fontSize, setFontSize] = useState(48);
  const [presentationTheme, setPresentationTheme] = useState<ThemeKey>("dark");
  const [programMode, setProgramMode] = useState<"content" | "black" | "logo">("content");
  const [rawQuery, setRawQuery] = useState("");
  const debouncedQuery = useDebouncedValue(rawQuery, 250);

  const hymnNum = parseInt(number || "0", 10);

  useEffect(() => {
    const found = HYMNS.find((h) => h.number === hymnNum);
    if (found) {
      setHymn(found);
      setSlides(getHymnSlides(found));
      setLastHymn(found.number);
      addRecent({
        id: `hymn-${found.number}`,
        type: "hymn",
        title: `Harpa ${found.number} — ${found.title}`,
        subtitle: "Harpa Cristã",
        href: `/hymns/${found.number}`,
      });
    }
  }, [hymnNum]);

  const { previewIdx, programIdx, isLive, setPreview, goLive, previewPrev, previewNext } = usePresentableList(slides, (slide) => ({
    text: slide.text,
    reference: slide.label || `Hino ${hymn?.number}`,
    bookName: hymn?.title || "",
    chapter: 0,
    verseNumber: 0,
  }));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        goLive();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goLive]);

  useEffect(() => {
    if (programIdx !== null) setProgramMode("content");
  }, [programIdx]);

  const sendCommand = presentationBus.sendCommand.bind(presentationBus);
  const handleOpenPresentation = () => (presentationActive ? closePresentation() : openPresentationWindow());
  const handleClear = () => { sendCommand({ type: "clear" }); setProgramMode("logo"); };
  const handleBlack = () => { sendCommand({ type: "black" }); setProgramMode("black"); };
  const handleThemeChange = (t: ThemeKey) => { setPresentationTheme(t); sendCommand({ type: "theme", value: t }); };
  const handleFontSizeChange = (size: number) => { setFontSize(size); sendCommand({ type: "fontSize", value: size }); };
  const handleToggleFullscreen = toggleFullscreen;

  const results = useMemo(() => (!debouncedQuery.trim() ? HYMNS : searchHymns(debouncedQuery)), [debouncedQuery]);

  const mutedClass = appTheme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const surfaceClass = appTheme === "dark" ? "bg-dark-surface border-dark-border" : "bg-light-surface border-light-border";
  const textClass = appTheme === "dark" ? "text-dark-text-primary" : "text-light-text-primary";
  const cardClass = appTheme === "dark" ? "border-dark-border" : "border-light-border";
  const chipClass = appTheme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const inputClass = appTheme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";

  const previewSlide = slides[previewIdx];
  const programSlide = programIdx !== null ? slides[programIdx] : null;

  return (
    <div className="flex-1 min-h-0 flex">
      <div className={`w-[272px] shrink-0 border-r ${surfaceClass} flex flex-col min-h-0`}>
        <div className="p-3.5 border-b border-inherit flex flex-col gap-2.5">
          <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${inputClass}`}>
            <MagnifyingGlass size={14} className={mutedClass} />
            <input value={rawQuery} onChange={(e) => setRawQuery(e.target.value)} placeholder="Número ou palavra do hino…" className="flex-1 min-w-0 bg-transparent outline-none text-xs" />
          </div>
          <p className={`text-[11px] ${mutedClass}`}>{debouncedQuery.trim() ? `${results.length} resultado${results.length !== 1 ? "s" : ""}` : `${HYMNS.length} hinos`}</p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className={`text-xs text-center py-6 ${mutedClass}`}>Nenhum hino encontrado</p>
          ) : (
            results.map((h) => (
              <button
                key={h.number}
                onClick={() => navigate(`/hymns/${h.number}`)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition mb-0.5 ${
                  h.number === hymnNum ? "bg-primary/15 border border-primary/50" : `border border-transparent ${appTheme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`
                }`}
              >
                <span className={`font-mono text-xs w-7 shrink-0 text-right ${h.number === hymnNum ? "text-primary font-bold" : mutedClass}`}>{h.number}</span>
                <span className="text-[13px] font-medium truncate flex-1">{h.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {!hymn ? (
        <div className={`flex-1 flex items-center justify-center ${textClass}`}>Hino não encontrado</div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className={`flex items-center justify-between px-7 py-4 border-b ${cardClass} shrink-0`}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold text-primary">{hymn.number}</span>
              <h1 className={`text-xl font-bold ${textClass}`}>{hymn.title}</h1>
              <span className={`font-mono text-xs ${mutedClass}`}>{slides.length > 0 ? `${previewIdx + 1} de ${slides.length} slides` : "Nenhum slide"}</span>
            </div>
            <button
              onClick={handleOpenPresentation}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                presentationActive ? "bg-success/20 border border-success/30 text-success hover:bg-success/30" : "bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
              }`}
            >
              <Broadcast size={16} weight={presentationActive ? "fill" : "regular"} />
              {presentationActive ? "Apresentando" : "Apresentar"}
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
            {slides.length === 0 ? (
              <p className={mutedClass}>Nenhum slide para este hino.</p>
            ) : (
              <div className="space-y-2.5">
                {slides.map((slide, idx) => {
                  const isProgram = idx === programIdx && presentationActive;
                  const isPreview = idx === previewIdx;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setPreview(idx)}
                      onDoubleClick={() => { setPreview(idx); goLive(); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isProgram ? "bg-danger/10 border-danger/50" : isPreview ? "bg-primary/15 border-primary/50" : `border-transparent ${appTheme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {slide.label && <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{slide.label}</span>}
                        {isProgram && <span className="text-[9px] font-bold uppercase tracking-wider text-danger">No ar</span>}
                      </div>
                      <p className={`text-sm leading-relaxed line-clamp-4 font-serif ${appTheme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>{slide.text}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <PresenterPanel
        previewLabel={previewSlide?.label || (previewSlide && hymn ? `Hino ${hymn.number}` : undefined)}
        previewText={previewSlide?.text}
        programLabel={programSlide?.label || (programSlide && hymn ? `Hino ${hymn.number}` : undefined)}
        programText={programSlide?.text}
        isLive={isLive}
        previewIndex={previewIdx}
        total={slides.length}
        presentationActive={presentationActive}
        onOpenPresentation={handleOpenPresentation}
        onPrev={previewPrev}
        onNext={previewNext}
        onGoLive={goLive}
        onClear={handleClear}
        onBlack={handleBlack}
        programMode={programMode}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        theme={presentationTheme}
        onThemeChange={handleThemeChange}
        onToggleFullscreen={handleToggleFullscreen}
      />
    </div>
  );
}
