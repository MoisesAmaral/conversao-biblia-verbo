import { workflow } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function Workflow() {
  return (
    <section id="como-funciona" className="bg-light-surface px-5 py-24 lg:px-8">
      <SectionHeader
        eyebrow="Simples de operar"
        title="Do conteúdo à tela em três passos."
        description="Qualquer voluntário da equipe de mídia consegue operar já no primeiro culto. Sem treinamento demorado, sem manual complicado."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3">
        {workflow.map((item) => (
          <article
            key={item.step}
            className="relative rounded-xl border border-light-border bg-light-bg p-8"
          >
            <span className="font-display inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
              {item.step}
            </span>
            <h3 className="font-display mt-5 text-2xl font-bold text-light-text-primary">{item.title}</h3>
            <p className="mt-4 leading-7 text-light-text-secondary">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
