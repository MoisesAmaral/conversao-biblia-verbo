import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { Folder, getFolders } from "../lib/folders";
import { Slide } from "../types";
import { PresenterPanel } from "../components/PresenterPanel";
import { usePresentableList } from "../hooks/usePresentableList";
import { addRecent } from "../lib/recent";
import { presentationBus } from "../lib/presentationBus";

type ThemeKey = "dark" | "light" | "blue" | "sepia";

export default function PresentationViewer() {
  const { folderId, presentationId } = useParams<{ folderId: string; presentationId: string }>();
  const navigate = useNavigate();
  const { theme: appTheme } = useTheme();
  const { presentationActive, openPresentation: openPresentationWindow, closePresentation, toggleFullscreen } = useApp();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(48);
  const [presentationTheme, setPresentationTheme] = useState<ThemeKey>("dark");
  const [programMode, setProgramMode] = useState<"content" | "black" | "logo">("content");

  const { previewIdx, programIdx, isLive, setPreview, goLive, previewPrev, previewNext } = usePresentableList(slides, (slide) => ({
    text: slide.text,
    reference: slide.label || `Slide ${slides.indexOf(slide) + 1}`,
    bookName: "",
    chapter: 0,
    verseNumber: 0,
    title: slide.title,
    background: slide.style?.background,
    titleColor: slide.style?.titleColor,
    align: slide.style?.align,
  }));

  useEffect(() => {
    loadPresentation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, presentationId]);

  const loadPresentation = async () => {
    if (!folderId || !presentationId) return;
    setLoading(true);
    const folders = await getFolders();
    const f = folders.find((f) => f.id === folderId);
    const pres = f?.presentations.find((p) => p.id === presentationId);
    if (f && pres) {
      setFolder(f);
      setSlides(pres.slides);
      addRecent({
        id: `pres-${pres.id}`,
        type: "presentation",
        title: pres.name,
        subtitle: f.name,
        href: `/folders/${f.id}/presentations/${pres.id}/present`,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
      if (isTyping) return;
      if (e.code === "Space") {
        e.preventDefault();
        goLive();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isLive) presentationBus.requestNavigate("next");
        else previewNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isLive) presentationBus.requestNavigate("prev");
        else previewPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goLive, isLive, previewNext, previewPrev]);

  useEffect(() => {
    if (programIdx !== null) setProgramMode("content");
  }, [programIdx]);

  const openPresentation = () => (presentationActive ? closePresentation() : openPresentationWindow());
  const sendCommand = presentationBus.sendCommand.bind(presentationBus);
  const handleClear = () => { sendCommand({ type: "clear" }); setProgramMode("logo"); };
  const handleBlack = () => { sendCommand({ type: "black" }); setProgramMode("black"); };
  const handleThemeChange = (t: ThemeKey) => { setPresentationTheme(t); sendCommand({ type: "theme", value: t }); };
  const handleFontSizeChange = (size: number) => { setFontSize(size); sendCommand({ type: "fontSize", value: size }); };
  const handleToggleFullscreen = toggleFullscreen;

  const textClass = appTheme === "dark" ? "text-dark-text-primary" : "text-light-text-primary";
  const mutedClass = appTheme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const cardClass = appTheme === "dark" ? "border-dark-border" : "border-light-border";
  const chipClass = appTheme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";

  if (loading) return <div className="flex-1 min-h-0 flex items-center justify-center">Carregando...</div>;
  if (!folder) return <div className="flex-1 min-h-0 flex items-center justify-center">Apresentação não encontrada</div>;

  const previewSlide = slides[previewIdx];
  const programSlide = programIdx !== null ? slides[programIdx] : null;

  return (
    <div className="flex-1 min-h-0 flex">
      <div className={`flex-1 flex flex-col border-r ${cardClass} min-w-0`}>
        <div className={`border-b ${cardClass} px-8 py-5 shrink-0`}>
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 -ml-3 mb-3 rounded-lg text-sm font-medium transition ${chipClass}`}
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
          <h1 className={`text-xl font-bold mb-1 ${textClass}`}>{folder.name}</h1>
          <p className={`text-xs ${mutedClass}`}>{slides.length > 0 ? `${previewIdx + 1} de ${slides.length} slides` : "Nenhum slide"}</p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
          {slides.length === 0 ? (
            <p className={mutedClass}>Nenhum slide nesta apresentação.</p>
          ) : (
            <div className="space-y-2.5">
              {slides.map((slide, idx) => {
                const isProgram = idx === programIdx && presentationActive;
                const isPreview = idx === previewIdx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setPreview(idx)}
                    onDoubleClick={() => {
                      setPreview(idx);
                      goLive();
                    }}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all cursor-pointer
                      ${
                        isProgram
                          ? "bg-danger/10 border-danger/50"
                          : isPreview
                            ? "bg-primary/15 border-primary/50"
                            : `border-transparent ${appTheme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-primary">Slide {idx + 1}</span>
                      {isProgram && <span className="text-[9px] font-bold uppercase tracking-wider text-danger">No ar</span>}
                    </div>
                    {slide.label && <span className="text-sm font-semibold mb-1 block">{slide.label}</span>}
                    <p className={`text-sm leading-relaxed line-clamp-2 font-serif ${appTheme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                      {slide.text}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PresenterPanel
        previewLabel={previewSlide?.label || undefined}
        previewText={previewSlide?.text}
        programLabel={programSlide?.label || undefined}
        programText={programSlide?.text}
        isLive={isLive}
        previewIndex={previewIdx}
        total={slides.length}
        presentationActive={presentationActive}
        onOpenPresentation={openPresentation}
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
