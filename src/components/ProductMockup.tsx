import { ArrowsOut, Broadcast, CaretLeft, CaretRight, Play } from "@phosphor-icons/react";

export function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xl border border-dark-border2 bg-dark-bg-secondary p-2 shadow-halo">
      <div className="flex items-center gap-2 rounded-t-lg bg-dark-surface px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-danger" />
        <span className="h-3 w-3 rounded-full bg-warning" />
        <span className="h-3 w-3 rounded-full bg-success" />
        <span className="ml-3 text-xs font-semibold text-dark-text-muted">Bíblia Verbo — Painel do operador</span>
      </div>

      <div className="grid overflow-hidden rounded-b-lg border border-dark-surface bg-dark-surface lg:grid-cols-[1fr_300px]">
        <div className="min-h-[380px] bg-dark-bg p-6 text-white md:p-10">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-10 text-sm font-bold tracking-widest text-primary-light">NOME DA SUA IGREJA AQUI!</div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-light">João 3:16</p>
            <blockquote className="font-display mt-6 max-w-3xl text-2xl font-bold leading-snug md:text-4xl">
              "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito."
            </blockquote>
            <div className="my-7 h-px w-24 bg-primary/50" />
            <p className="font-serif text-xl italic text-primary-light">Bíblia Verbo</p>
          </div>
        </div>

        <aside className="border-l border-dark-border bg-dark-card p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-dark-text-muted">Projeção</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/50 px-2.5 py-1 text-[11px] font-semibold text-danger">
              <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-current" />
              No ar
            </span>
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">
            <Broadcast className="h-4 w-4" weight="fill" />
            Fechar apresentação
          </button>

          <div className="mt-5">
            <p className="mb-1.5 text-[10px] font-bold tracking-widest text-danger">PROGRAMA · TELA 2</p>
            <div className="rounded-lg border-2 border-danger bg-black p-3 text-center">
              <p className="font-serif text-[11px] italic leading-snug">"Porque Deus amou o mundo..."</p>
              <p className="mt-1.5 font-mono text-[8.5px] uppercase tracking-wide text-white/50">João 3:16</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold tracking-widest text-primary-light">PREVIEW</p>
            <div className="rounded-lg border-2 border-dashed border-primary/40 bg-black p-3 text-center opacity-70">
              <p className="text-[10px] text-white/30">Selecione um item</p>
            </div>
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-danger px-4 py-3 text-sm font-bold text-white">
            <Play className="h-4 w-4" weight="fill" />
            Ir ao ar
            <span className="font-mono text-[10px] opacity-80">Espaço</span>
          </button>

          <div className="mt-4 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-soft px-3 py-2 text-sm font-bold text-primary-light">
              <CaretLeft className="h-3.5 w-3.5" weight="bold" />
              Anterior
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-soft px-3 py-2 text-sm font-bold text-primary-light">
              Próximo
              <CaretRight className="h-3.5 w-3.5" weight="bold" />
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-dark-text-muted">
              Tema
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["Escuro", "Claro", "Azul", "Sépia"].map((theme) => (
                <button
                  key={theme}
                  className="flex items-center gap-2 rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs font-bold"
                >
                  <span className="h-3.5 w-3.5 rounded-sm bg-dark-bg ring-1 ring-primary/40" />
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dark-border px-4 py-3 text-sm font-bold transition hover:border-primary/50">
            <ArrowsOut className="h-4 w-4" />
            Tela cheia
          </button>
        </aside>
      </div>
    </div>
  );
}
