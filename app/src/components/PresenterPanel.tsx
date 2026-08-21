import {
  ArrowsOut,
  Broadcast,
  CaretLeft,
  CaretRight,
  Cross,
  ImageSquare,
  Moon,
  Play,
  ScrollIcon,
  Square,
  Sun,
  Waves,
} from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import Dot from "./Dot";

export interface PresenterPanelProps {
  previewLabel?: string;
  previewText?: string;
  programLabel?: string;
  programText?: string;
  programMode?: "content" | "black" | "logo";
  isLive: boolean;
  previewIndex: number;
  total: number;
  presentationActive: boolean;
  onOpenPresentation: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  onGoLive: () => void;
  onClear: () => void;
  onBlack: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: "dark" | "light" | "blue" | "sepia";
  onThemeChange: (theme: "dark" | "light" | "blue" | "sepia") => void;
  onToggleFullscreen: () => void;
}

const THEMES = [
  { key: "dark", label: "Escuro", icon: Moon, color: "from-gray-700 to-gray-900" },
  { key: "light", label: "Claro", icon: Sun, color: "from-yellow-200 to-yellow-300" },
  { key: "blue", label: "Azul", icon: Waves, color: "from-blue-600 to-blue-800" },
  { key: "sepia", label: "Sépia", icon: ScrollIcon, color: "from-amber-700 to-amber-900" },
] as const;

function ScreenBox({
  label,
  text,
  variant,
  placeholder,
  mode,
}: {
  label?: string;
  text?: string;
  variant: "program" | "preview";
  placeholder: string;
  mode?: "content" | "black" | "logo";
}) {
  const borderColor = variant === "program" ? "border-danger" : "border-primary";
  const hasOverride = mode === "black" || mode === "logo";
  const active = hasOverride || !!text;

  return (
    <div
      className={`aspect-video rounded-lg border-2 ${active ? borderColor : "border-dashed border-current opacity-40"} bg-black overflow-hidden flex flex-col items-center justify-center text-center px-3 py-2 relative`}
    >
      {mode === "black" ? (
        <p className="font-mono text-[9px] text-white/40 tracking-widest uppercase">Tela preta</p>
      ) : mode === "logo" ? (
        <>
          <Cross size={18} className="text-white/40 mb-1.5" />
          <p className="font-mono text-[9px] text-white/40 tracking-widest uppercase">Logo</p>
        </>
      ) : text ? (
        <>
          <p className="font-serif text-[11px] leading-snug text-white line-clamp-3 italic">"{text}"</p>
          {label && <p className="font-mono text-[8.5px] text-white/50 mt-1.5 tracking-wide uppercase">{label}</p>}
        </>
      ) : (
        <p className="text-[10px] text-white/30">{placeholder}</p>
      )}
    </div>
  );
}

export function PresenterPanel(props: PresenterPanelProps) {
  const { theme: appTheme } = useTheme();

  const surfaceClass = appTheme === "dark" ? "bg-dark-surface border-dark-border" : "bg-light-surface border-light-border";
  const cardClass = appTheme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";
  const textMutedClass = appTheme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const chipHover = appTheme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2";

  const statusLabel = props.isLive ? "No ar" : props.presentationActive ? "Pronto" : "Fechada";
  const statusClass = props.isLive
    ? "border-danger/50 text-danger"
    : props.presentationActive
      ? "border-success/50 text-success"
      : `${textMutedClass} border-transparent`;

  return (
    <aside className={`w-[300px] shrink-0 border-l ${surfaceClass} p-4 overflow-y-auto flex flex-col gap-3.5`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-widest ${textMutedClass}`}>Projeção</span>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusClass}`}>
          <Dot className={`bg-current ${props.isLive ? "animate-pulse" : ""}`} />
          {statusLabel}
        </span>
      </div>

      <button
        onClick={props.onOpenPresentation}
        className={`w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-full text-sm font-bold
          transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5
          ${props.presentationActive ? "bg-success text-white" : "bg-primary text-white"}
        `}
      >
        <Broadcast size={17} weight={props.presentationActive ? "fill" : "regular"} />
        {props.presentationActive ? "Fechar apresentação" : "Abrir apresentação"}
      </button>

      <div>
        <p className={`text-[10px] font-bold tracking-widest mb-1.5 ${props.isLive || props.programMode === "black" || props.programMode === "logo" ? "text-danger" : textMutedClass}`}>
          PROGRAMA · TELA 2
        </p>
        <ScreenBox variant="program" label={props.programLabel} text={props.programText} placeholder="Nada no ar" mode={props.programMode} />
      </div>

      <div>
        <p className="text-[10px] font-bold tracking-widest mb-1.5 text-primary">PREVIEW</p>
        <ScreenBox variant="preview" label={props.previewLabel} text={props.previewText} placeholder="Selecione um item" />
      </div>

      <button
        onClick={props.onGoLive}
        disabled={!props.previewText}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold bg-danger text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        <Play size={16} weight="fill" />
        Ir ao ar
        <span className="text-[10px] font-mono opacity-80">Espaço</span>
      </button>

      {props.total > 0 && (
        <div className={`rounded-lg border ${cardClass} p-2.5 text-center`}>
          <span className="text-sm font-bold text-primary">{props.previewIndex + 1}</span>
          <span className={`text-xs ${textMutedClass}`}> de {props.total}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={props.onPrev}
          disabled={!(props.canPrev ?? props.previewIndex > 0)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            !(props.canPrev ?? props.previewIndex > 0) ? "opacity-40 cursor-not-allowed" : `text-primary ${appTheme === "dark" ? "bg-primary-soft" : "bg-primary/10"} hover:opacity-80`
          }`}
        >
          <CaretLeft size={14} weight="bold" />
          Anterior
        </button>
        <button
          onClick={props.onNext}
          disabled={!(props.canNext ?? props.previewIndex < props.total - 1)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            !(props.canNext ?? props.previewIndex < props.total - 1) ? "opacity-40 cursor-not-allowed" : `text-primary ${appTheme === "dark" ? "bg-primary-soft" : "bg-primary/10"} hover:opacity-80`
          }`}
        >
          Próximo
          <CaretRight size={14} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={props.onBlack}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            props.programMode === "black" ? "bg-danger text-white" : `${cardClass} ${chipHover}`
          }`}
        >
          <Square size={14} weight="fill" />
          Preto
        </button>
        <button
          onClick={props.onClear}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            props.programMode === "logo" ? "bg-danger text-white" : `${cardClass} ${chipHover}`
          }`}
        >
          <ImageSquare size={14} />
          Logo
        </button>
      </div>

      <div className={`h-px ${appTheme === "dark" ? "bg-dark-border" : "bg-light-border"}`} />

      <div>
        <label className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 block ${textMutedClass}`}>Tamanho</label>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => props.onFontSizeChange(Math.max(12, props.fontSize - 4))}
            className={`w-9 h-9 rounded-lg font-bold transition shrink-0 ${cardClass} ${chipHover}`}
          >
            A
          </button>
          <input
            type="range"
            min="12"
            max="128"
            value={props.fontSize}
            onChange={(e) => props.onFontSizeChange(parseInt(e.target.value, 10))}
            className="flex-1 h-1.5 rounded-full cursor-pointer accent-primary"
          />
          <button
            onClick={() => props.onFontSizeChange(Math.min(128, props.fontSize + 4))}
            className={`w-9 h-9 rounded-lg font-bold text-lg transition shrink-0 ${cardClass} ${chipHover}`}
          >
            A
          </button>
        </div>
        <p className={`text-[11px] text-center font-mono mt-1.5 ${textMutedClass}`}>{props.fontSize}px</p>
      </div>

      <div>
        <label className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 block ${textMutedClass}`}>Tema</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => props.onThemeChange(t.key as typeof props.theme)}
                className={`px-3 py-2.5 rounded-lg font-semibold transition-all ${
                  props.theme === t.key ? `bg-gradient-to-r ${t.color} text-white shadow-md` : `border ${cardClass} ${chipHover}`
                }`}
              >
                <Icon size={16} className="mx-auto mb-1" />
                <span className="text-[11px] block">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`h-px ${appTheme === "dark" ? "bg-dark-border" : "bg-light-border"}`} />

      <div className="space-y-2 mt-auto">
        <button
          onClick={props.onToggleFullscreen}
          className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${cardClass} ${chipHover}`}
        >
          <ArrowsOut size={14} />
          Tela cheia
        </button>
      </div>
    </aside>
  );
}
