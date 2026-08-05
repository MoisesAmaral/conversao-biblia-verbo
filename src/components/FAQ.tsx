import { Plus } from "@phosphor-icons/react";
import { faqs } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function FAQ() {
  return (
    <section id="faq" className="bg-paper px-5 py-16 md:py-[90px] lg:px-10">
      <SectionHeader
        eyebrow="Dúvidas frequentes"
        title="Perguntas que ajudam na decisão."
        description="Respostas diretas para pastores, líderes e responsáveis pela mídia entenderem se a Bíblia Verbo serve para a igreja."
      />

      <div className="mx-auto mt-11 flex max-w-[820px] flex-col gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group overflow-hidden rounded-[14px] border border-line bg-card"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 md:px-6 [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-[15.5px] font-bold text-ink md:text-[16.5px]">
                {faq.question}
              </span>
              <Plus
                className="h-[18px] w-[18px] shrink-0 text-accent transition-transform group-open:rotate-45"
                weight="bold"
              />
            </summary>
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-body md:px-6">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
