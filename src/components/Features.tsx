import { features } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function Features() {
  return (
    <section id="recursos" className="bg-light-bg px-5 py-24 lg:px-8">
      <SectionHeader
        eyebrow="Mais que uma Bíblia digital"
        title="Uma ferramenta criada especialmente para igrejas."
        description="Enquanto outras Bíblias são feitas para leitura pessoal, a Bíblia Verbo foi desenvolvida para quem ministra, ensina e conduz a projeção durante o culto."
      />

      <div className="mx-auto mt-14 grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-xl border border-light-border bg-light-card p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-light-card2 ring-1 ring-light-border transition group-hover:bg-primary/10">
              <feature.icon className="h-6 w-6 text-primary-dark" />
            </span>
            <h3 className="font-display mt-6 text-xl font-bold text-light-text-primary">{feature.title}</h3>
            <p className="mt-3 leading-7 text-light-text-secondary">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
