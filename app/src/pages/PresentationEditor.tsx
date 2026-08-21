import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ClipboardText, Plus, CaretUp, CaretDown, CaretRight, Trash, CardsThree,
  FloppyDisk, Play, Folder as FolderIcon, FolderOpen, TextAlignLeft, TextAlignCenter, TextAlignRight, Image,
} from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { Folder, getFolders, savePresentationSlides } from "../lib/folders";
import { Slide, SlideStyle } from "../types";

const BG_PRESETS = [
  { key: "navy", css: "linear-gradient(135deg, #161b3a, #0f1226)" },
  { key: "black", css: "#0b0d12" },
  { key: "red", css: "linear-gradient(135deg, #3a1620, #1a0d12)" },
];

const DEFAULT_STYLE: SlideStyle = {
  background: BG_PRESETS[0].css,
  titleColor: "#ffffff",
  titleSize: 34,
  titleWeight: "extrabold",
  align: "center",
};

const WEIGHT_LABELS: Record<SlideStyle["titleWeight"], string> = {
  normal: "Archivo · Regular",
  semibold: "Archivo · Semibold",
  extrabold: "Archivo · Extrabold",
};

const WEIGHT_CSS: Record<SlideStyle["titleWeight"], number> = {
  normal: 500,
  semibold: 700,
  extrabold: 800,
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PresentationEditor() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { folderId, presentationId } = useParams<{ folderId: string; presentationId: string }>();

  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(true);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slidesRef = useRef<Slide[]>([]);
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    loadPresentation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, presentationId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, presentationId]);

  const loadPresentation = async () => {
    if (!folderId || !presentationId) return;
    setLoading(true);
    const folders = await getFolders();
    setAllFolders(folders);
    setExpandedFolderId(folderId);
    const f = folders.find((f) => f.id === folderId);
    const pres = f?.presentations.find((p) => p.id === presentationId);
    if (f && pres) {
      setFolder(f);
      setSlides(pres.slides);
      setSelectedSlideIdx(pres.slides.length > 0 ? 0 : null);
      setSaved(true);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!folderId || !presentationId) return;
    const ok = await savePresentationSlides(folderId, presentationId, slidesRef.current);
    if (ok) {
      setSaved(true);
      setActionMsg("Apresentação salva!");
      setTimeout(() => setActionMsg(""), 2000);
    }
  };

  const updateSelectedSlide = (patch: Partial<Slide>) => {
    if (selectedSlideIdx === null) return;
    const newSlides = [...slides];
    newSlides[selectedSlideIdx] = { ...newSlides[selectedSlideIdx], ...patch };
    setSlides(newSlides);
    setSaved(false);
  };

  const updateSelectedStyle = (patch: Partial<SlideStyle>) => {
    if (selectedSlideIdx === null) return;
    const current = slides[selectedSlideIdx].style ?? DEFAULT_STYLE;
    updateSelectedSlide({ style: { ...current, ...patch } });
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      label: null,
      title: "",
      text: "",
      style: { ...DEFAULT_STYLE },
    };
    setSlides([...slides, newSlide]);
    setSaved(false);
    setSelectedSlideIdx(slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
    setSaved(false);
    if (selectedSlideIdx === index) {
      setSelectedSlideIdx(slides.length > 1 ? Math.min(index, slides.length - 2) : null);
    }
  };

  const handlePasteAndSplit = () => {
    if (!pasteText.trim()) return;
    const newSlides = pasteText
      .split(/\n\s*\n+/)
      .filter((s) => s.trim())
      .map((text, idx) => ({
        id: `slide-${Date.now()}-${idx}`,
        label: null,
        title: "",
        text: text.trim(),
        style: { ...DEFAULT_STYLE },
      }));
    setSlides([...slides, ...newSlides]);
    setPasteText("");
    setShowPaste(false);
    setSaved(false);
    setSelectedSlideIdx(slides.length);
    setActionMsg(`${newSlides.length} slide(s) adicionado(s)!`);
    setTimeout(() => setActionMsg(""), 2000);
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newSlides.length) {
      [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
      setSlides(newSlides);
      setSaved(false);
      setSelectedSlideIdx(newIndex);
    }
  };

  const handlePickBackgroundImage = () => fileInputRef.current?.click();

  const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateSelectedStyle({ background: `url(${dataUrl}) center/cover no-repeat` });
  };

  const handlePresent = () => {
    if (!folderId || !presentationId) return;
    navigate(`/folders/${folderId}/presentations/${presentationId}/present`);
  };

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const railBg = theme === "dark" ? "bg-dark-surface" : "bg-light-surface";
  const inputClass = theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border2";

  if (loading) return <div className="flex-1 min-h-0 flex items-center justify-center">Carregando...</div>;

  const selectedSlide = selectedSlideIdx !== null ? slides[selectedSlideIdx] : null;
  const selectedStyle = selectedSlide?.style ?? DEFAULT_STYLE;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleBackgroundFileChange} className="hidden" />

      <div className={`border-b ${headerClass} px-6 py-3 shrink-0 flex items-center justify-between`}>
        <div className={`flex items-center gap-1.5 text-sm ${mutedClass}`}>
          <button onClick={() => navigate("/folders")} className="hover:text-primary transition">Departamentos</button>
          <CaretRight size={11} />
          <button onClick={() => navigate(`/folders/${folderId}`)} className="hover:text-primary transition">{folder?.name}</button>
          <CaretRight size={11} />
          <span className="font-semibold text-primary">{folder?.presentations.find((p) => p.id === presentationId)?.name}</span>
        </div>
        <div className="flex gap-2.5 items-center">
          {actionMsg && <span className="text-xs text-success font-medium">{actionMsg}</span>}
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${chipClass}`}>
            <FloppyDisk size={13} />
            {saved ? "Salvo" : "Alterações"}
          </span>
          <button onClick={handleSave} className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${chipClass}`}>
            Salvar <span className="text-[10px] font-mono opacity-60 ml-1">Ctrl+S</span>
          </button>
          <button
            onClick={handlePresent}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition flex items-center gap-1.5"
          >
            <Play size={14} weight="fill" />
            Apresentar
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        <div className={`w-[236px] shrink-0 border-r ${headerClass} ${railBg} flex flex-col min-h-0`}>
          <div className={`px-4 py-3 border-b ${headerClass} flex items-center justify-between`}>
            <h2 className="font-bold text-xs">Departamentos</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {allFolders.map((f) => {
              const isExpanded = f.id === expandedFolderId;
              return (
                <div key={f.id} className="mb-0.5">
                  <button
                    onClick={() => setExpandedFolderId(isExpanded ? null : f.id)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${theme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`}
                  >
                    {isExpanded ? <FolderOpen size={16} weight="fill" className="text-warning shrink-0" /> : <FolderIcon size={16} weight="fill" className={`shrink-0 ${mutedClass}`} />}
                    <span className="flex-1 text-left truncate font-medium">{f.name}</span>
                    <CaretDown size={11} className={`shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"} ${mutedClass}`} />
                  </button>
                  {isExpanded && (
                    <div className="pl-6">
                      {f.presentations.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => navigate(`/folders/${f.id}/presentations/${p.id}/edit`)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition text-left ${
                            p.id === presentationId
                              ? "bg-primary/15 border border-primary/40 text-primary font-semibold"
                              : `border border-transparent ${mutedClass} ${theme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`
                          }`}
                        >
                          <CardsThree size={14} className="shrink-0" />
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className={`px-5 py-2.5 border-b ${headerClass} flex items-center gap-2`}>
            <button
              onClick={() => setShowPaste((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${showPaste ? "bg-primary text-white" : chipClass}`}
            >
              <ClipboardText size={13} />
              Colar e dividir
            </button>
          </div>

          {showPaste && (
            <div className={`p-4 border-b ${headerClass} ${cardClass}`}>
              <textarea
                autoFocus
                placeholder="Cole a letra aqui. Slides serão divididos por linhas em branco..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className={`w-full h-24 rounded-lg border px-4 py-3 outline-none resize-none transition focus:ring-2 focus:ring-primary text-sm ${inputClass}`}
              />
              <button
                onClick={handlePasteAndSplit}
                disabled={!pasteText.trim()}
                className="mt-2.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Dividir em slides
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 grid place-items-center p-7 overflow-hidden">
            {selectedSlide ? (
              <div
                className="w-full max-w-[620px] aspect-video rounded-xl relative flex flex-col shadow-2xl overflow-hidden"
                style={{
                  background: selectedStyle.background,
                  alignItems: selectedStyle.align === "left" ? "flex-start" : selectedStyle.align === "right" ? "flex-end" : "center",
                  justifyContent: "center",
                  padding: "10%",
                }}
              >
                <textarea
                  value={selectedSlide.title || ""}
                  onChange={(e) => updateSelectedSlide({ title: e.target.value })}
                  placeholder="Título do slide"
                  rows={2}
                  className="bg-transparent outline-none resize-none w-full placeholder:text-white/30 mb-3"
                  style={{
                    color: selectedStyle.titleColor,
                    fontSize: `${selectedStyle.titleSize}px`,
                    fontWeight: WEIGHT_CSS[selectedStyle.titleWeight],
                    fontFamily: "Archivo, sans-serif",
                    textAlign: selectedStyle.align,
                    lineHeight: 1.2,
                  }}
                />
                <textarea
                  value={selectedSlide.text}
                  onChange={(e) => updateSelectedSlide({ text: e.target.value })}
                  placeholder="Texto do slide..."
                  rows={3}
                  className="bg-transparent outline-none resize-none w-full placeholder:text-white/30"
                  style={{
                    color: selectedStyle.titleColor,
                    opacity: 0.85,
                    fontSize: `${Math.round(selectedStyle.titleSize * 0.47)}px`,
                    fontFamily: "Archivo, sans-serif",
                    textAlign: selectedStyle.align,
                    lineHeight: 1.5,
                  }}
                />
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-white/10 text-white/50 text-[10px] font-mono">logo</div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-primary/30 p-12 text-center max-w-md">
                <CardsThree size={36} className="mx-auto mb-4 text-primary" />
                <p className="text-lg font-bold mb-2">{slides.length === 0 ? "Crie seu primeiro slide" : "Selecione um slide"}</p>
                <p className={`text-sm mb-6 ${mutedClass}`}>
                  {slides.length === 0 ? "Clique no botão abaixo, ou cole um texto e divida automaticamente" : "Clique em uma miniatura no filmstrip abaixo"}
                </p>
                {slides.length === 0 && (
                  <button
                    onClick={handleAddSlide}
                    className="px-6 py-2.5 rounded-lg font-bold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2"
                  >
                    <Plus size={15} weight="bold" />
                    Criar primeiro slide
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={`h-[118px] shrink-0 border-t ${headerClass} ${railBg} px-4 py-2.5 flex items-center gap-3 overflow-x-auto`}>
            {slides.map((slide, idx) => {
              const style = slide.style ?? DEFAULT_STYLE;
              return (
                <div key={slide.id} className="text-center shrink-0 group relative">
                  <button
                    onClick={() => setSelectedSlideIdx(idx)}
                    className={`w-[124px] aspect-video rounded-lg overflow-hidden border-2 flex flex-col items-center justify-center p-2 text-center transition ${
                      selectedSlideIdx === idx ? "border-primary" : "border-transparent hover:border-primary/40"
                    }`}
                    style={{ background: style.background }}
                  >
                    {slide.title && (
                      <span className="text-white font-bold text-[9px] leading-tight line-clamp-2" style={{ textAlign: style.align }}>
                        {slide.title}
                      </span>
                    )}
                    {!slide.title && slide.text && <span className="text-white/70 text-[8px] leading-tight line-clamp-3">{slide.text}</span>}
                  </button>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="font-mono text-[10px] text-primary">{idx + 1}</span>
                    <button onClick={() => handleMoveSlide(idx, "up")} disabled={idx === 0} className={`opacity-0 group-hover:opacity-100 transition disabled:!opacity-0 ${mutedClass}`}>
                      <CaretUp size={10} />
                    </button>
                    <button onClick={() => handleMoveSlide(idx, "down")} disabled={idx === slides.length - 1} className={`opacity-0 group-hover:opacity-100 transition disabled:!opacity-0 ${mutedClass}`}>
                      <CaretDown size={10} />
                    </button>
                    <button onClick={() => handleDeleteSlide(idx)} className="opacity-0 group-hover:opacity-100 transition text-danger">
                      <Trash size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              onClick={handleAddSlide}
              className={`w-[124px] aspect-video rounded-lg border-2 border-dashed shrink-0 grid place-items-center transition ${theme === "dark" ? "border-dark-border2 hover:border-primary/50" : "border-light-border2 hover:border-primary/50"} ${mutedClass}`}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {selectedSlide && (
          <div className={`w-[250px] shrink-0 border-l ${headerClass} ${railBg} p-4 overflow-y-auto flex flex-col gap-5`}>
            <span className={`text-[11px] font-bold uppercase tracking-widest ${mutedClass}`}>Texto do título</span>

            <div>
              <label className={`text-[11px] block mb-1.5 ${mutedClass}`}>Fonte</label>
              <select
                value={selectedStyle.titleWeight}
                onChange={(e) => updateSelectedStyle({ titleWeight: e.target.value as SlideStyle["titleWeight"] })}
                className={`w-full rounded-lg border px-2.5 py-2 outline-none text-xs ${inputClass}`}
              >
                {(Object.keys(WEIGHT_LABELS) as SlideStyle["titleWeight"][]).map((w) => (
                  <option key={w} value={w}>{WEIGHT_LABELS[w]}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className={`text-[11px] block mb-1.5 ${mutedClass}`}>Tamanho</label>
                <input
                  type="number"
                  min={16}
                  max={72}
                  value={selectedStyle.titleSize}
                  onChange={(e) => updateSelectedStyle({ titleSize: Number(e.target.value) || DEFAULT_STYLE.titleSize })}
                  className={`w-full rounded-lg border px-2.5 py-2 outline-none text-xs font-mono ${inputClass}`}
                />
              </div>
              <div className="flex-1">
                <label className={`text-[11px] block mb-1.5 ${mutedClass}`}>Cor</label>
                <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${inputClass}`}>
                  <input
                    type="color"
                    value={selectedStyle.titleColor}
                    onChange={(e) => updateSelectedStyle({ titleColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <span className="text-[11px] font-mono truncate">{selectedStyle.titleColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className={`text-[11px] block mb-1.5 ${mutedClass}`}>Alinhamento</label>
              <div className="flex gap-1.5">
                {([
                  { key: "left", icon: TextAlignLeft },
                  { key: "center", icon: TextAlignCenter },
                  { key: "right", icon: TextAlignRight },
                ] as const).map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => updateSelectedStyle({ align: key })}
                    className={`flex-1 py-2 rounded-lg grid place-items-center transition ${selectedStyle.align === key ? "bg-primary text-white" : chipClass}`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className={`pt-4 border-t ${headerClass}`}>
              <label className={`text-[11px] block mb-2 ${mutedClass}`}>Fundo do slide</label>
              <div className="flex gap-1.5 flex-wrap">
                {BG_PRESETS.map((bg) => (
                  <button
                    key={bg.key}
                    onClick={() => updateSelectedStyle({ background: bg.css })}
                    className="w-8 h-8 rounded-lg transition"
                    style={{ background: bg.css, outline: selectedStyle.background === bg.css ? "2px solid #7a1622" : "none", outlineOffset: 2 }}
                  />
                ))}
                <button onClick={handlePickBackgroundImage} className={`w-8 h-8 rounded-lg grid place-items-center transition ${chipClass}`} title="Escolher imagem">
                  <Image size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
