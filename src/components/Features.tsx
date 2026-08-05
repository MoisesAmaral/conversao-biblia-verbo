import { features } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function Features() {
  return (
    <section id="recursos" className="bg-paper px-5 py-16 md:py-24 lg:px-10">
      <SectionHeader
        eyebrow="Mais que uma Bíblia digital"
        title="Uma ferramenta criada especialmente para igrejas."
        description="Enquanto outras Bíblias são feitas para leitura pessoal, a Bíblia Verbo foi desenvolvida para quem ministra, ensina e conduz a projeção durante o culto."
      />

      <div className="mx-auto mt-12 grid max-w-[1180px] gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-line bg-card p-6 transition hover:-translate-y-1 hover:shadow-card"
          >
            <span className="mb-4 grid h-[46px] w-[46px] place-items-center rounded-xl bg-accsoft">
              <feature.icon className="h-6 w-6 text-accent" />
            </span>
            <h3 className="text-lg font-extrabold tracking-tight text-ink">
              {feature.title}
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-body">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
