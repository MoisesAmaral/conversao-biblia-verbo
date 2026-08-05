import { workflow } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function Workflow() {
  return (
    <section id="como-funciona" className="bg-paper2 px-5 py-16 md:py-24 lg:px-10">
      <SectionHeader
        eyebrow="Simples de operar"
        title="Do conteúdo à tela em três passos."
        description="Qualquer voluntário da equipe de mídia consegue operar já no primeiro culto. Sem treinamento demorado, sem manual complicado."
      />

      <div className="mx-auto mt-12 grid max-w-[1180px] gap-[22px] md:grid-cols-3">
        {workflow.map((item) => (
          <article
            key={item.step}
            className="rounded-[18px] border border-line bg-card p-7 md:p-8"
          >
            <p className="num-stroke font-mono text-[44px] font-bold leading-none">
              {item.step}
            </p>
            <h3 className="mt-4 text-xl font-extrabold tracking-tight text-ink">
              {item.title}
            </h3>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-body">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
