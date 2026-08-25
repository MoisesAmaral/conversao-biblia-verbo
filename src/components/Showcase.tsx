import { SectionHeader } from "./SectionHeader";
import { AppTour } from "./AppTour";

export function Showcase() {
  return (
    <section id="demo" className="relative overflow-hidden bg-navy px-5 py-16 md:py-[90px] lg:px-10">
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(900px_500px_at_50%_-10%,rgba(200,16,46,.22),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-[1180px]">
        <SectionHeader
          tone="dark"
          eyebrow="Demonstração"
          title="Imagine isso na TV da sua igreja."
          description="Cada versículo projetado com clareza, sobriedade e a identidade da sua congregação — do primeiro louvor à palavra final."
        />

        {/* slide projetado */}
        <div className="mt-12 flex aspect-video flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#161b3a] to-[#0e1122] p-8 text-center shadow-panel md:aspect-[16/7] md:p-10">
          <p className="text-[11px] font-extrabold tracking-[.2em] text-white/50 md:text-xs">
            IGREJA VERBO
          </p>
          <blockquote className="mt-5 max-w-[800px] font-serif text-xl leading-normal text-white sm:text-2xl md:mt-6 md:text-3xl">
            "Porque Deus amou o mundo de tal maneira que deu o seu Filho
            unigênito."
          </blockquote>
          <p className="mt-4 font-mono text-[11px] tracking-[2px] text-accent2 md:mt-5 md:text-[13px]">
            JOÃO 3.16
          </p>
        </div>

        <div className="mt-11">
          <p className="mb-5 text-center text-[13px] font-semibold text-[#9aa2b3]">
            Veja por dentro do painel do operador — clique nas abas abaixo.
          </p>
          <AppTour />
        </div>
      </div>
    </section>
  );
}
