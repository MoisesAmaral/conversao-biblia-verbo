import { CheckCircle, LockKeyOpen, SealCheck, ShieldCheck, Star } from "@phosphor-icons/react";
import { checkoutUrl, offer } from "../data/site";

export function Pricing() {
  return (
    <section id="planos" className="relative overflow-hidden bg-navy px-5 py-16 md:py-24 lg:px-10">
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(800px_500px_at_50%_-10%,rgba(201,154,63,.16),transparent_60%),radial-gradient(700px_500px_at_90%_110%,rgba(106,88,234,.2),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-[900px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-gold">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-gold" />
            Investimento
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-white md:text-[40px]">
            Uma licença completa. Um único valor.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#b9c0d0] md:text-[17px]">
            Sem planos confusos, sem mensalidade escondida. Você paga uma vez e
            sua igreja recebe a ferramenta completa, com ativação imediata.
          </p>
        </div>

        <div className="mt-11 grid overflow-hidden rounded-[22px] bg-white shadow-panel lg:grid-cols-[1fr_1.1fr]">
          {/* lado do preço */}
          <div className="flex flex-col border-b border-line bg-paper2 p-7 sm:p-10 lg:border-b-0 lg:border-r">
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-gold px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.1em] text-[#1a1406]">
              <Star className="h-3 w-3" weight="fill" />
              Oferta única
            </span>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-ink md:text-[26px]">
              {offer.name}
            </h3>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-body">
              {offer.description}
            </p>
            <div className="mt-auto pt-6">
              <p className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-dim">R$</span>
                <span className="text-[56px] font-black tracking-tight text-ink">297</span>
              </p>
              <p className="text-[13px] text-dim">{offer.priceNote}</p>
              <a
                href={checkoutUrl}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[11px] bg-gold px-5 py-4 text-base font-bold text-[#1a1406] shadow-btn-gold transition hover:-translate-y-px"
              >
                <LockKeyOpen className="h-5 w-5" weight="fill" />
                Quero minha licença agora
              </a>
              <p className="mt-3.5 flex items-center justify-center gap-2 text-[12.5px] text-dim">
                <ShieldCheck className="h-4 w-4 text-ok" weight="fill" />
                Garantia incondicional de 7 dias
              </p>
            </div>
          </div>

          {/* lado dos itens incluídos */}
          <div className="grid content-start gap-x-5 gap-y-3.5 p-7 sm:grid-cols-2 sm:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[.1em] text-accent sm:col-span-2">
              Tudo incluído
            </p>
            {offer.items.map((item) => (
              <p key={item} className="flex gap-2.5 text-sm text-ink">
                <CheckCircle className="h-[19px] w-[19px] shrink-0 text-ok" weight="fill" />
                {item}
              </p>
            ))}
            <div className="mt-2 flex gap-3 rounded-xl bg-accsoft p-4 sm:col-span-2">
              <SealCheck className="h-[26px] w-[26px] shrink-0 text-accent" weight="fill" />
              <p className="text-[13px] leading-relaxed text-ink">
                <b>Garantia incondicional de 7 dias.</b> Instale, use no culto e
                comprove. Se não atender à sua igreja, devolvemos 100% — sem
                perguntas, sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
