import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, SignOut, ShieldCheck } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import Rail from "./Rail";
import logoMark from "../assets/logo-mark.png";

interface Props {
  children: ReactNode;
  onOpenSettings: () => void;
}

export default function AppShell({ children, onOpenSettings }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { profile, isAdmin } = useApp();
  const navigate = useNavigate();

  const bgClass = theme === "dark" ? "bg-dark-bg text-dark-text-primary" : "bg-light-bg text-light-text-primary";
  const barClass =
    theme === "dark" ? "bg-dark-surface border-dark-border text-dark-text-muted" : "bg-light-surface border-light-border text-light-text-muted";
  const wcHover = theme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2";

  const churchInitial = profile?.church_name?.trim()?.[0]?.toUpperCase();

  return (
    <div className={`flex h-screen w-full overflow-hidden ${bgClass}`}>
      <Rail onOpenSettings={onOpenSettings} churchInitial={churchInitial} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className={`flex items-center justify-between h-14 shrink-0 border-b px-5 ${barClass}`}>
          <div className="flex items-center gap-2">
            <img src={logoMark} alt="" className="h-7 w-7 object-contain" />
            <span className="text-sm font-bold">Bíblia Verbo</span>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <button onClick={() => navigate("/admin")} className={`w-9 h-9 grid place-items-center rounded-lg transition text-primary-light ${wcHover}`} title="Painel de controle">
                <ShieldCheck size={16} />
              </button>
            )}
            <button onClick={toggleTheme} className={`w-9 h-9 grid place-items-center rounded-lg transition ${wcHover}`} title="Alternar tema">
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button onClick={signOut} className={`w-9 h-9 grid place-items-center rounded-lg transition ${wcHover}`} title="Sair">
              <SignOut size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
