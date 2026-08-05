import { ArrowRight, Check, ShieldCheck } from "@phosphor-icons/react";
import { checkoutUrl, offer } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function Pricing() {
  return (
    <section id="planos" className="bg-light-surface px-5 py-24 lg:px-8">
      <SectionHeader
        eyebrow="Investimento"
        title="Uma licença completa. Um único valor."
        description="Sem planos confusos, sem mensalidade escondida. Você paga uma vez e sua igreja recebe a ferramenta completa, com ativação imediata."
      />

      <div className="mx-auto mt-14 max-w-2xl">
        <article className="relative rounded-xl border border-primary bg-dark-surface p-8 text-white shadow-halo md:p-10">
          <span className="absolute right-6 top-6 rounded-lg bg-primary px-3 py-1 text-xs font-black text-white">
            Oferta única
          </span>

          <h3 className="font-display text-2xl font-bold">{offer.name}</h3>
          <p className="mt-3 leading-7 text-dark-text-secondary">{offer.description}</p>

          <div className="mt-7 flex items-end gap-3">
            <p className="font-display text-6xl font-bold">{offer.price}</p>
          </div>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-primary-light">
            {offer.priceNote}
          </p>

          <a
            href={checkoutUrl}
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 font-black text-white shadow-glow transition hover:bg-primary-dark"
          >
            Quero minha licença agora
            <ArrowRight className="h-5 w-5" />
          </a>

          <div className="mt-9 grid gap-4 border-t border-dark-border pt-8 sm:grid-cols-2">
            {offer.items.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary-light" />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </article>

        <div className="mt-8 flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <ShieldCheck className="h-10 w-10 shrink-0 text-primary-dark" />
          <p className="leading-7 text-light-text-secondary">
            <strong className="text-light-text-primary">Garantia incondicional de 7 dias.</strong> Instale, use no
            culto e comprove. Se a Bíblia Verbo não atender à sua igreja, devolvemos 100% do valor —
            sem perguntas, sem burocracia.
          </p>
        </div>
      </div>
    </section>
  );
}
