import { WhatsappLogo } from "@phosphor-icons/react";
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
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-5 md:h-[70px] lg:gap-7 lg:px-10">
        <a href="#" className="flex items-center gap-2.5" aria-label="Bíblia Verbo">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-accent text-lg font-black text-white">
            V
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-ink">
            Bíblia Verbo
          </span>
        </a>

        <div className="hidden flex-1 items-center gap-6 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-dim transition hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-[11px] border border-line px-4 py-2.5 text-[13.5px] font-bold text-ink transition hover:-translate-y-px sm:inline-flex"
          >
            <WhatsappLogo className="h-4 w-4 text-ok" weight="fill" />
            WhatsApp
          </a>
          <a
            href={checkoutUrl}
            className="inline-flex items-center rounded-[11px] bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-btn transition hover:-translate-y-px sm:px-5"
          >
            Comprar agora
          </a>
        </div>
      </nav>
    </header>
  );
}
