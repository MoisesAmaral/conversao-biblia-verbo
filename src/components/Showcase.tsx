import {
  BookOpenText,
  Broadcast,
  SlidersHorizontal,
  Television,
} from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const screens = [
  {
    icon: BookOpenText,
    title: "Busca dos livros",
    description:
      "Encontre rapidamente qualquer passagem do Antigo e Novo Testamento.",
  },
  {
    icon: Television,
    title: "Tela de apresentação",
    description: "Versículos, hinos e slides em tela cheia, legíveis de longe.",
  },
  {
    icon: SlidersHorizontal,
    title: "Painel de controle",
    description: "Avance versículos e troque o tema sem que a igreja perceba.",
  },
  {
    icon: Broadcast,
    title: "Tela Ao vivo",
    description: "Busque e coloque no ar qualquer conteúdo num só lugar.",
  },
];

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

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {screens.map((screen) => (
            <article
              key={screen.title}
              className="rounded-xl border border-white/10 bg-white/[.04] p-5"
            >
              <screen.icon className="h-[22px] w-[22px] text-accent2" />
              <h3 className="mt-3 text-[15px] font-extrabold text-white">
                {screen.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#9aa2b3]">
                {screen.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
