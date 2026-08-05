import { BookOpenText, EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react";
import { whatsappUrl } from "../data/site";

export function Footer() {
  return (
    <footer className="border-t border-light-border bg-light-bg px-5 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <BookOpenText className="h-5 w-5" weight="fill" />
          </span>
          <div>
            <p className="font-display font-bold text-light-text-primary">Bíblia Verbo</p>
            <p className="text-sm text-light-text-secondary">A Palavra apresentada com excelência.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-light-text-secondary">
          <a href={whatsappUrl} className="inline-flex items-center gap-2 transition hover:text-primary-dark">
            <WhatsappLogo className="h-4 w-4" weight="fill" />
            WhatsApp
          </a>
          <a
            href="mailto:contato@bibliaverbo.com"
            className="inline-flex items-center gap-2 transition hover:text-primary-dark"
          >
            <EnvelopeSimple className="h-4 w-4" />
            contato@bibliaverbo.com
          </a>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-7xl border-t border-light-border pt-6 text-xs text-light-text-muted">
        © {new Date().getFullYear()} Bíblia Verbo. Todos os direitos reservados.
      </p>
    </footer>
  );
}
