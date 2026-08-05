import { CaretDown } from "@phosphor-icons/react";
import { faqs } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function FAQ() {
  return (
    <section id="faq" className="bg-light-surface px-5 py-24 lg:px-8">
      <SectionHeader
        eyebrow="Dúvidas frequentes"
        title="Perguntas que ajudam na decisão."
        description="Respostas diretas para pastores, líderes e responsáveis pela mídia entenderem se a Bíblia Verbo serve para a igreja."
      />

      <div className="mx-auto mt-14 grid max-w-4xl gap-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-light-border bg-light-bg p-6 transition open:border-primary/50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-light-text-primary">
              {faq.question}
              <CaretDown className="h-5 w-5 shrink-0 text-primary-dark transition group-open:rotate-180" />
            </summary>
            <p className="mt-4 leading-7 text-light-text-secondary">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
