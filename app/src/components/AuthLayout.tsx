import { ReactNode } from "react";
import logoFull from "../assets/logo-full.png";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-dark-bg">
      {/* mesmo tratamento de fundo (grid sutil + glow) do app desktop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(560px 420px at 50% 20%, rgba(130,87,229,0.10), transparent 70%),
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 64px 64px, 64px 64px",
        }}
      />

      <div className="relative w-full max-w-md px-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 scale-125 rounded-full bg-primary/15 blur-2xl" />
            <img src={logoFull} alt="Bíblia Verbo" className="relative w-56 max-w-full object-contain" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-dark-text-primary text-xl font-bold mb-1">{title}</h1>
          <p className="text-dark-text-muted text-sm">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
