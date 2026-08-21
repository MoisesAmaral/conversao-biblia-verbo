import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Broadcast, BookOpenText, MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { fetchVerses, Verse } from "../lib/bible";
import { parseReference } from "../lib/search";
import { PresenterPanel } from "../components/PresenterPanel";
import { usePresentableList } from "../hooks/usePresentableList";
import { addRecent } from "../lib/recent";
import { presentationBus } from "../lib/presentationBus";

type ThemeKey = "dark" | "light" | "blue" | "sepia";
const LAST_CHAPTER_KEY = "lastChapter";

export default function Chapter() {
  const { bookId, chapter } = useParams<{ bookId: string; chapter: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { books, versions, currentVersion, setVersion, presentationActive, openPresentation: openPresentationWindow, closePresentation, toggleFullscreen } = useApp();

  const bookOrderNum = Number(bookId);
  const chapterNum = Number(chapter);
  const book = books.find((b) => b.order_num === bookOrderNum);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [presFontSize, setPresFontSize] = useState(72);
  const [presentationTheme, setPresentationTheme] = useState<ThemeKey>("dark");
  const [programMode, setProgramMode] = useState<"content" | "black" | "logo">("content");
  const [refQuery, setRefQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  const bgClass = theme === "dark" ? "bg-dark-bg" : "bg-light-bg";
  const surfaceClass = theme === "dark" ? "bg-dark-surface border-dark-border" : "bg-light-surface border-light-border";
  const textPrimaryClass = theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary";
  const textMutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const inputClass = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";

  const toPresentData = (verse: Verse) => ({
    text: verse.text,
    reference: `${book?.name ?? ""} ${chapterNum}:${verse.number}`,
    bookName: book?.name ?? "",
    chapter: chapterNum,
    verseNumber: verse.number,
  });

  const { previewIdx, programIdx, isLive, setPreview, goLive, previewPrev, previewNext, reset } = usePresentableList(verses, toPresentData);

  useEffect(() => {
    if (!currentVersion) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setVerses([]);
    reset();
    fetchVerses(bookOrderNum, chapterNum, currentVersion.id).then((vs) => {
      if (requestIdRef.current !== requestId) return;
      setVerses(vs);
      setLoading(false);
    });
    scrollRef.current?.scrollTo({ top: 0 });
    if (!Number.isNaN(bookOrderNum) && !Number.isNaN(chapterNum)) {
      localStorage.setItem(LAST_CHAPTER_KEY, JSON.stringify({ book: bookOrderNum, chapter: chapterNum }));
    }
  }, [bookOrderNum, chapterNum, currentVersion, reset]);

  useEffect(() => {
    const verseParam = searchParams.get("verse");
    if (verseParam && verses.length > 0) {
      const targetVerse = parseInt(verseParam, 10);
      const matchIdx = verses.findIndex((v) => v.number === targetVerse);
      if (matchIdx >= 0) {
        setPreview(matchIdx);
        setTimeout(() => {
          document.getElementById(`verse-${targetVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
      if (isTyping) return;
      if (e.code === "Space") {
        e.preventDefault();
        goLive();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        previewNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        previewPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goLive, previewNext, previewPrev]);

  const handleGoLive = () => {
    goLive();
    setProgramMode("content");
    const verse = verses[previewIdx];
    if (verse && book) {
      addRecent({
        id: `verse-${book.order_num}-${chapterNum}`,
        type: "verse",
        title: `${book.name} ${chapterNum}`,
        subtitle: `Bíblia · ${currentVersion?.abbreviation ?? ""}`,
        href: `/chapter/${book.order_num}/${chapterNum}?verse=${verse.number}`,
      });
    }
  };

  const sendCommand = presentationBus.sendCommand.bind(presentationBus);
  const openPresentation = () => (presentationActive ? closePresentation() : openPresentationWindow());
  const handleClear = () => { sendCommand({ type: "clear" }); setProgramMode("logo"); };
  const handleBlack = () => { sendCommand({ type: "black" }); setProgramMode("black"); };
  const handleThemeChange = (t: ThemeKey) => { setPresentationTheme(t); sendCommand({ type: "theme", value: t }); };
  const handlePresFontSizeChange = (size: number) => { setPresFontSize(size); sendCommand({ type: "fontSize", value: size }); };
  const handleToggleFullscreen = toggleFullscreen;

  const handleRefSearch = () => {
    const ref = parseReference(refQuery, books);
    if (ref) {
      const suffix = ref.verse ? `?verse=${ref.verse}` : "";
      navigate(`/chapter/${ref.book.order_num}/${ref.chapter}${suffix}`);
      setRefQuery("");
    }
  };

  const previewVerse = verses[previewIdx];
  const programVerse = programIdx !== null ? verses[programIdx] : null;
  const oldTestament = books.filter((b) => b.testament === "OT");
  const newTestament = books.filter((b) => b.testament === "NT");

  const renderBookPills = (list: typeof books, label: string) => {
    if (list.length === 0) return null;
    return (
      <div>
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textMutedClass}`}>{label}</div>
        <div className="flex flex-wrap gap-1.5">
          {list.map((b) => (
            <button
              key={b.order_num}
              onClick={() => navigate(`/chapter/${b.order_num}/1`)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${b.order_num === bookOrderNum ? "bg-primary text-white" : chipClass}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-1 min-h-0 flex flex-col ${bgClass}`}>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className={`w-[272px] shrink-0 border-r ${surfaceClass} flex flex-col min-h-0`}>
          <div className="p-3.5 border-b border-inherit flex flex-col gap-2.5">
            <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${inputClass}`}>
              <MagnifyingGlass size={14} className={textMutedClass} />
              <input
                value={refQuery}
                onChange={(e) => setRefQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRefSearch()}
                placeholder="Livro, cap:ver…"
                className="flex-1 min-w-0 bg-transparent outline-none text-xs"
              />
            </div>
            {versions.length > 1 && (
              <div className={`relative rounded-lg text-xs font-semibold ${chipClass}`}>
                <select
                  value={currentVersion?.id ?? ""}
                  onChange={(e) => {
                    const v = versions.find((v) => v.id === e.target.value);
                    if (v) setVersion(v);
                  }}
                  className="w-full appearance-none bg-transparent pl-3 pr-8 py-2 outline-none cursor-pointer"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>{v.abbreviation}</option>
                  ))}
                </select>
                <CaretDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-5">
            {renderBookPills(oldTestament, "Antigo Testamento")}
            {renderBookPills(newTestament, "Novo Testamento")}
            {book && (
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textMutedClass}`}>{book.name} · Capítulo</div>
                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: book.chapters_count }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => navigate(`/chapter/${bookOrderNum}/${ch}`)}
                      className={`font-mono text-xs py-1.5 rounded-lg font-semibold transition ${ch === chapterNum ? "bg-primary text-white" : chipClass}`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className={`flex items-center justify-between px-7 py-4 border-b ${surfaceClass} shrink-0`}>
            <div className="flex items-baseline gap-2.5">
              <h1 className={`${textPrimaryClass} text-xl font-bold`}>{book?.name} {chapterNum}</h1>
              <span className={`font-mono text-xs ${textMutedClass}`}>{currentVersion?.abbreviation} · {verses.length} versículos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" title="Tamanho da leitura (não afeta a Tela 2)">
                <button onClick={() => setFontSize((s) => Math.max(12, s - 2))} className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition ${chipClass}`}>A</button>
                <button onClick={() => setFontSize((s) => Math.min(32, s + 2))} className={`px-2.5 py-1.5 rounded-lg text-lg font-bold transition ${chipClass}`}>A</button>
              </div>
              <button
                onClick={openPresentation}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  presentationActive ? "bg-success/20 border border-success/30 text-success hover:bg-success/30" : "bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
                }`}
              >
                <Broadcast size={16} weight={presentationActive ? "fill" : "regular"} />
                {presentationActive ? "Apresentando" : "Apresentar"}
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className={`${textMutedClass} text-sm font-medium`}>Carregando versículos...</p>
              </div>
            )}
            {!loading && verses.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-primary ${theme === "dark" ? "bg-primary/10 border border-primary/20" : "bg-primary/5 border border-primary/10"}`}>
                  <BookOpenText size={22} />
                </div>
                <p className={`${textMutedClass} text-sm max-w-xs text-center`}>Versículos não encontrados para essa versão.</p>
              </div>
            )}
            {verses.map((verse, idx) => {
              const isProgram = idx === programIdx && presentationActive;
              const isPreview = idx === previewIdx;
              return (
                <div
                  key={`${bookOrderNum}-${chapterNum}-${verse.number}`}
                  id={`verse-${verse.number}`}
                  className={`group relative flex gap-4 py-3 px-4 rounded-xl mb-2 transition-all cursor-pointer ${
                    isProgram
                      ? "bg-danger/10 border border-danger/40"
                      : isPreview
                        ? `${theme === "dark" ? "bg-primary/15 border border-primary/40" : "bg-primary/10 border border-primary/30"}`
                        : `border border-transparent hover:${theme === "dark" ? "bg-dark-surface/50" : "bg-light-surface/50"}`
                  }`}
                  onClick={() => setPreview(idx)}
                  onDoubleClick={() => { setPreview(idx); handleGoLive(); }}
                >
                  {(isPreview || isProgram) && (
                    <span className={`absolute -top-2 left-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white ${isProgram ? "bg-danger" : "bg-primary"}`}>
                      {isProgram ? "No ar" : "No preview"}
                    </span>
                  )}
                  <span className="text-primary font-bold text-sm w-6 shrink-0 pt-1 text-right font-mono">{verse.number}</span>
                  <p className={`${textPrimaryClass} font-serif leading-relaxed flex-1`} style={{ fontSize }}>{verse.text}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(idx); handleGoLive(); }}
                    className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1 p-1.5 rounded-lg ${theme === "dark" ? "hover:bg-dark-surface text-dark-text-muted" : "hover:bg-light-surface text-light-text-muted"}`}
                    title="Ir ao ar com este versículo"
                  >
                    <Broadcast size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <PresenterPanel
          previewLabel={previewVerse ? `${book?.name} ${chapterNum}:${previewVerse.number}` : undefined}
          previewText={previewVerse?.text}
          programLabel={programVerse ? `${book?.name} ${chapterNum}:${programVerse.number}` : undefined}
          programText={programVerse?.text}
          isLive={isLive}
          previewIndex={previewIdx}
          total={verses.length}
          presentationActive={presentationActive}
          onOpenPresentation={openPresentation}
          onPrev={previewPrev}
          onNext={previewNext}
          onGoLive={handleGoLive}
          onClear={handleClear}
          onBlack={handleBlack}
          programMode={programMode}
          fontSize={presFontSize}
          onFontSizeChange={handlePresFontSizeChange}
          theme={presentationTheme}
          onThemeChange={handleThemeChange}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </div>
    </div>
  );
}
