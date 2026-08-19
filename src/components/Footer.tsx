import { EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react";
import { whatsappUrl } from "../data/site";

export function Footer() {
  return (
    <footer className="bg-navy px-5 pb-10 pt-12 lg:px-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[360px]">
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-[17px] font-black text-white">
              V
            </span>
            <span className="text-base font-extrabold text-white">Bíblia Verbo</span>
          </div>
          <p className="text-sm leading-relaxed text-[#8b94a3]">
            A Palavra apresentada com excelência.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#c7cede] transition hover:text-white"
          >
            <WhatsappLogo className="h-4 w-4 text-ok" weight="fill" />
            WhatsApp
          </a>
          <a
            href="mailto:contato@bibliaverbo.com"
            className="inline-flex items-center gap-2 text-sm text-[#c7cede] transition hover:text-white"
          >
            <EnvelopeSimple className="h-4 w-4 text-accent2" />
            contato@bibliaverbo.com
          </a>
        </div>
      </div>

      <div className="mx-auto mt-9 flex max-w-[1180px] flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12.5px] text-[#69727f]">
        <span>
          © {new Date().getFullYear()} Bíblia Verbo. Todos os direitos reservados.
        </span>
        {/*
          Crédito discreto, não competindo com a identidade do produto: mesmo
          tratamento mono-uppercase-vermelho do rodapé do site da 123DEVS.
        */}
        <a
          href="https://123devs.com.br"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[.14em] text-[#69727f] uppercase transition hover:text-[#E01B33]"
        >
          <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#C8102E]" />
          feito pela 123devs
        </a>
      </div>
    </footer>
  );
}
