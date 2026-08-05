import { ArrowRight, SealCheck, WhatsappLogo } from "@phosphor-icons/react";
import { checkoutUrl, whatsappUrl } from "../data/site";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-dark-bg px-5 py-24 text-white lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-primary-light">
          <span className="h-px w-8 bg-primary" />
          Bíblia Verbo
          <span className="h-px w-8 bg-primary" />
        </p>
        <h2 className="font-display mt-4 text-4xl font-bold md:text-6xl">
          Transforme a forma como sua igreja apresenta a Palavra.
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-dark-text-secondary">
          Cada versículo, hino ou apresentação exibido com clareza, elegância e a identidade
          da sua congregação — já no próximo culto.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={checkoutUrl}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-primary px-7 font-black text-white shadow-glow transition hover:bg-primary-dark"
          >
            Adquirir minha licença
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href={whatsappUrl}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-dark-border2 px-7 font-black text-white transition hover:border-primary/50 hover:bg-dark-card"
          >
            <WhatsappLogo className="h-5 w-5" weight="fill" />
            Falar no WhatsApp
          </a>
        </div>

        <p className="mt-6 inline-flex items-center gap-2 text-sm text-primary-light">
          <SealCheck className="h-4 w-4 text-success" weight="fill" />
          Compra protegida por garantia incondicional de 7 dias
        </p>
      </div>
    </section>
  );
}
