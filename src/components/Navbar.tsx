import { ArrowRight, BookOpenText, WhatsappLogo } from "@phosphor-icons/react";
import { checkoutUrl, whatsappUrl } from "../data/site";

const links = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Demonstração", href: "#demo" },
  { label: "Preço", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-dark-border bg-dark-bg/90 text-white backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#" className="flex items-center gap-3" aria-label="Bíblia Verbo">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-glow">
            <BookOpenText className="h-5 w-5" weight="fill" />
          </span>
          <span>
            <span className="font-display block text-base font-bold tracking-wide">
              Bíblia Verbo
            </span>
            <span className="block text-xs text-primary-light">A Palavra apresentada com excelência</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-dark-text-secondary transition hover:text-primary-light"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            className="hidden h-11 items-center gap-2 rounded-lg border border-dark-border2 px-4 text-sm font-bold text-white transition hover:border-primary/50 hover:bg-dark-card sm:flex"
          >
            <WhatsappLogo className="h-4 w-4" weight="fill" />
            WhatsApp
          </a>
          <a
            href={checkoutUrl}
            className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white shadow-glow transition hover:bg-primary-dark"
          >
            Comprar agora
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  );
}
