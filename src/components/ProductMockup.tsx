import {
  ArrowsOut,
  CaretLeft,
  CaretRight,
  Play,
  Square,
} from "@phosphor-icons/react";
import logoMark from "../assets/logo-mark.png";

// Réplica do painel do operador do design de referência (Preview/Programa)
export function ProductMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0d] shadow-panel">
      {/* barra de título */}
      <div className="flex h-[38px] items-center gap-2.5 border-b border-white/5 bg-[#131316] px-3.5">
        <img src={logoMark} alt="" className="h-[26px] w-[26px] object-contain" />
        <span className="truncate text-xs font-semibold text-[#c7cede]">
          Bíblia Verbo — Painel do operador
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-bold text-live">
          <span className="inline-block h-[7px] w-[7px] animate-blink rounded-full bg-live" />
          No ar
        </span>
      </div>

      {/* Programa / Preview */}
      <div className="grid grid-cols-1 gap-3 p-3.5 min-[420px]:grid-cols-2">
        <div>
          <p className="mb-1.5 font-mono text-[9px] tracking-widest text-[#8b94a3]">
            PROGRAMA · TELA 2
          </p>
          <div className="flex aspect-video flex-col items-center justify-center rounded-lg border-2 border-live bg-gradient-to-br from-[#161b3a] to-[#0f1226] p-4 text-center">
            <p className="mb-2 text-[8.5px] font-extrabold tracking-[2px] text-white/55">
              IGREJA VERBO
            </p>
            <p className="font-serif text-[13px] leading-relaxed text-white">
              "Porque Deus amou o mundo de tal maneira que deu o seu Filho
              unigênito."
            </p>
            <p className="mt-2 font-mono text-[8px] tracking-[1.5px] text-accent2">
              JOÃO 3.16
            </p>
          </div>
        </div>
        <div>
          <p className="mb-1.5 font-mono text-[9px] tracking-widest text-[#8b94a3]">
            PREVIEW · A SEGUIR
          </p>
          <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-white/15 bg-[#0a0d16] p-4 text-center">
            <p className="font-serif text-xs leading-relaxed text-[#c7cede]">
              "Chuvas de bênção, chuvas de bênção nos vêm…"
            </p>
            <p className="mt-2 font-mono text-[8px] tracking-[1.5px] text-[#69727f]">
              HARPA 21 · CORO
            </p>
          </div>
        </div>
      </div>

      {/* controles */}
      <div className="flex items-center gap-2 px-3.5 pb-3.5">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-live px-3 py-2.5 text-[13px] font-bold text-white">
          <Play className="h-3.5 w-3.5" weight="fill" />
          Ir ao ar
          <span className="font-mono text-[9px] opacity-80">Espaço</span>
        </button>
        <button
          aria-label="Anterior"
          className="rounded-[11px] border border-white/10 bg-[#1a1f36] p-3 text-[#c7cede]"
        >
          <CaretLeft className="h-3.5 w-3.5" />
        </button>
        <button
          aria-label="Próximo"
          className="rounded-[11px] border border-white/10 bg-[#1a1f36] p-3 text-[#c7cede]"
        >
          <CaretRight className="h-3.5 w-3.5" />
        </button>
        <button
          aria-label="Limpar tela"
          className="rounded-[11px] border border-white/10 bg-[#1a1f36] p-3 text-[#c7cede]"
        >
          <Square className="h-3.5 w-3.5" weight="fill" />
        </button>
      </div>

      {/* temas */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-3.5 py-2.5">
        {["Tema: Escuro", "Claro", "Azul", "Sépia"].map((theme) => (
          <span
            key={theme}
            className="rounded-md bg-[#1a1f36] px-2 py-1 text-[10.5px] text-[#8b94a3]"
          >
            {theme}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-accsoft px-2 py-1 text-[10.5px] font-semibold text-accent">
          <ArrowsOut className="h-3 w-3" />
          Tela cheia
        </span>
      </div>
    </div>
  );
}
