import { features } from "../data/site";
import { SectionHeader } from "./SectionHeader";

// Mesmo tratamento de badge com glow colorido do app desktop (Home), variando entre os
// três acentos que a página já tem: roxo, dourado e verde — em vez de um único tom fixo.
const TINTS = ["#8257e5", "#c99a3f", "#1a9d68"] as const;

export function Features() {
  return (
    <section id="recursos" className="bg-paper px-5 py-16 md:py-24 lg:px-10">
      <SectionHeader
        eyebrow="Mais que uma Bíblia digital"
        title="Uma ferramenta criada especialmente para igrejas."
        description="Enquanto outras Bíblias são feitas para leitura pessoal, a Bíblia Verbo foi desenvolvida para quem ministra, ensina e conduz a projeção durante o culto."
      />

      <div className="mx-auto mt-12 grid max-w-[1180px] gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => {
          const tint = TINTS[idx % TINTS.length];
          return (
            <article
              key={feature.title}
              className="group rounded-2xl border border-line bg-card p-6 transition hover:-translate-y-1 hover:border-[var(--tint)] hover:shadow-card"
              style={{ ["--tint" as string]: tint }}
            >
              <span className="relative mb-4 grid h-[46px] w-[46px] place-items-center">
                <span
                  className="absolute inset-0 scale-150 rounded-full blur-lg opacity-25 transition-opacity group-hover:opacity-40"
                  style={{ background: tint }}
                />
                <span
                  className="relative grid h-full w-full place-items-center rounded-xl border"
                  style={{ background: `${tint}1a`, borderColor: `${tint}40` }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: tint }} />
                </span>
              </span>
              <h3 className="text-lg font-extrabold tracking-tight text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-body">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
