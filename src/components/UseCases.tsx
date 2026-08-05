import { useCases } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function UseCases() {
  return (
    <section className="bg-paper px-5 py-16 md:py-[90px] lg:px-10">
      <SectionHeader
        eyebrow="Para toda agenda da igreja"
        title="Um investimento que serve a semana inteira."
        description="Do culto de domingo à campanha especial: a mesma ferramenta acompanha toda a programação da igreja, sem mudar a rotina da equipe."
      />

      <div className="mx-auto mt-11 flex max-w-[1180px] flex-wrap justify-center gap-3.5">
        {useCases.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-5 py-4 text-[15px] font-semibold text-ink"
          >
            <item.icon className="h-5 w-5 text-accent" weight="fill" />
            {item.title}
          </div>
        ))}
      </div>
    </section>
  );
}
