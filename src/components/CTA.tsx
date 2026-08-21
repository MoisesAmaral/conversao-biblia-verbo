import { LockKeyOpen, ShieldCheck, WhatsappLogo } from "@phosphor-icons/react";
import { checkoutUrl, whatsappUrl } from "../data/site";

export function CTA() {
  return (
    <section className="bg-paper px-5 pb-16 md:pb-24 lg:px-10">
      <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-[#4f0e17] px-6 py-12 text-center md:px-12 md:py-16">
        <div
          aria-hidden
          className="absolute inset-0 [background:radial-gradient(600px_400px_at_80%_120%,rgba(255,255,255,.14),transparent_60%)]"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-[720px] text-3xl font-extrabold leading-[1.08] tracking-tight text-white md:text-[40px]">
            Transforme como sua igreja apresenta a Palavra.
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-base leading-relaxed text-white/90 md:text-lg">
            Cada versículo, hino ou apresentação exibido com clareza, elegância
            e a identidade da sua congregação — já no próximo culto.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:flex-wrap">
            <a
              href={checkoutUrl}
              className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-gold px-8 py-4 text-base font-bold text-[#1a1406] shadow-btn-gold transition hover:-translate-y-px"
            >
              <LockKeyOpen className="h-5 w-5" weight="fill" />
              Adquirir minha licença
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[11px] border border-white/30 bg-white/[.14] px-7 py-4 text-base font-bold text-white transition hover:-translate-y-px"
            >
              <WhatsappLogo className="h-5 w-5" weight="fill" />
              Falar no WhatsApp
            </a>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-[13px] text-white/85">
            <ShieldCheck className="h-4 w-4" weight="fill" />
            Compra protegida por garantia incondicional de 7 dias
          </p>
        </div>
      </div>
    </section>
  );
}
