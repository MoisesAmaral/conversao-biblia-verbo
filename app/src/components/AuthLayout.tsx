import { ReactNode } from "react";
import logoFull from "../assets/logo-full.png";
import logoMark from "../assets/logo-mark.png";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="fixed inset-0 flex bg-dark-bg text-dark-text-primary overflow-y-auto">
      {/* Painel de marca — split screen, some no mobile */}
      <div className="hidden lg:flex relative w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-dark-bg-secondary px-14 py-12">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(680px 520px at 15% 15%, rgba(122,22,34,0.28), transparent 60%),
              radial-gradient(520px 420px at 85% 85%, rgba(122,22,34,0.14), transparent 65%),
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 100% 100%, 56px 56px, 56px 56px",
          }}
        />
        <div
          className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #7a1622, transparent 70%)" }}
        />

        <div className="relative flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="" className="h-10 w-10 object-contain" />
            <span className="text-base font-bold tracking-tight">Bíblia Verbo</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-dark-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-dark-border2" />
            <span className="w-1.5 h-1.5 rounded-full bg-dark-border2" />
            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
          </div>
        </div>

        <div className="relative">
          <div
            className="w-10 h-10 rounded-xl grid place-items-center mb-8 text-primary-light"
            style={{ background: "rgba(122,22,34,0.18)", border: "1px solid rgba(122,22,34,0.4)" }}
          >
            <span className="font-serif italic text-lg">“</span>
          </div>
          <p className="font-serif italic text-[26px] leading-[1.4] text-dark-text-primary max-w-md">
            Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.
          </p>
          <p className="mt-5 text-dark-text-muted text-xs font-mono uppercase tracking-[0.14em]">
            Salmos 119:105
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-dark-text-muted text-[11px] font-mono uppercase tracking-[0.14em] opacity-70">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-light" />
          feito pela <span className="text-dark-text-secondary font-semibold">123devs</span>
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="relative flex-1 min-w-0 flex items-center justify-center px-6 py-12">
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `
              radial-gradient(560px 420px at 50% 15%, rgba(122,22,34,0.14), transparent 70%),
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 64px 64px, 64px 64px",
          }}
        />

        <div className="relative w-full max-w-sm">
          <div className="flex flex-col items-center gap-3 mb-8 lg:hidden">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-primary/15 blur-2xl" />
              <img src={logoFull} alt="" className="relative w-24 max-w-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-dark-text-primary">Bíblia Verbo</span>
          </div>

          <div className="mb-8">
            <h1 className="text-dark-text-primary text-3xl font-black uppercase tracking-tight leading-none mb-2">{title}</h1>
            <p className="text-dark-text-muted text-sm">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
