import { useCases } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function UseCases() {
  return (
    <section className="bg-light-surface px-5 py-24 lg:px-8">
      <SectionHeader
        eyebrow="Para toda agenda da igreja"
        title="Um investimento que serve a semana inteira."
        description="Do culto de domingo à campanha especial: a mesma ferramenta acompanha toda a programação da igreja, sem mudar a rotina da equipe."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((item) => (
          <article
            key={item.title}
            className="flex items-center gap-4 rounded-xl border border-light-border bg-light-bg p-5 transition hover:border-primary/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <item.icon className="h-6 w-6" />
            </span>
            <h3 className="font-display font-bold text-light-text-primary">{item.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
