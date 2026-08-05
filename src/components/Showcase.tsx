import { Broadcast, GearSix, MagnifyingGlass, Television } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const screens = [
  {
    icon: MagnifyingGlass,
    title: "Busca dos livros",
    description: "Visual limpo para encontrar rapidamente qualquer passagem do Antigo e Novo Testamento.",
  },
  {
    icon: Television,
    title: "Tela de apresentação",
    description: "Versículos, hinos e slides em tela cheia, com tipografia pensada para leitura confortável de longe.",
  },
  {
    icon: GearSix,
    title: "Painel de controle",
    description: "Avance versículos, troque o tema e ajuste a apresentação sem que a igreja perceba.",
  },
  {
    icon: Broadcast,
    title: "Tela Ao vivo",
    description: "Busque e coloque no ar qualquer conteúdo — Bíblia, Harpa ou apresentação — num só lugar.",
  },
];

export function Showcase() {
  return (
    <section id="demo" className="bg-light-bg px-5 py-24 lg:px-8">
      <SectionHeader
        eyebrow="Demonstração"
        title="Imagine isso na TV da sua igreja."
        description="Cada versículo projetado com clareza, sobriedade e a identidade da sua congregação — do primeiro louvor à palavra final."
      />

      <div className="mx-auto mt-14 max-w-6xl rounded-xl border border-primary/25 bg-dark-bg p-8 text-white shadow-halo md:p-14">
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary-light">João 3:16</p>
          <blockquote className="font-display mt-8 max-w-4xl text-3xl font-bold leading-snug md:text-5xl">
            "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito."
          </blockquote>
          <div className="my-8 h-px w-24 bg-primary/50" />
          <p className="font-serif text-2xl italic text-primary-light">Bíblia Verbo</p>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {screens.map((screen) => (
          <article key={screen.title} className="rounded-xl border border-light-border bg-light-card p-6 shadow-soft">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-light-card2 ring-1 ring-light-border">
              <screen.icon className="h-5 w-5 text-primary-dark" />
            </span>
            <h3 className="font-display mt-4 font-bold text-light-text-primary">{screen.title}</h3>
            <p className="mt-2 text-sm leading-6 text-light-text-secondary">{screen.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
