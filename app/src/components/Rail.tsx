import { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HouseSimple, BookOpenText, MusicNotes, Folders as FoldersIcon, Broadcast, GearSix } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { getBibleEntryPath } from "../lib/lastChapter";
import { getHymnEntryPath } from "../lib/lastHymn";

interface RailItem {
  path: string;
  label: string;
  icon: ElementType;
  matchPrefixes: string[];
}

const ITEMS: RailItem[] = [
  { path: "/", label: "Início", icon: HouseSimple, matchPrefixes: ["/"] },
  { path: "/bible", label: "Bíblia", icon: BookOpenText, matchPrefixes: ["/bible", "/chapter", "/search"] },
  { path: "/hymns", label: "Harpa Cristã", icon: MusicNotes, matchPrefixes: ["/hymns"] },
  { path: "/folders", label: "Departamentos", icon: FoldersIcon, matchPrefixes: ["/folders"] },
  { path: "/launcher", label: "Ao vivo — buscar e apresentar", icon: Broadcast, matchPrefixes: ["/launcher", "/live"] },
];

interface Props {
  onOpenSettings: () => void;
  churchInitial?: string;
}

export default function Rail({ onOpenSettings, churchInitial }: Props) {
  const { theme } = useTheme();
  const { books } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const resolveTarget = (item: RailItem) => {
    if (item.path === "/bible") return getBibleEntryPath(books.length > 0);
    if (item.path === "/hymns") return getHymnEntryPath();
    return item.path;
  };

  const surfaceClass = theme === "dark" ? "bg-dark-surface border-dark-border" : "bg-light-surface border-light-border";
  const faintClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const hoverClass = theme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2";

  const isActive = (item: RailItem) =>
    item.path === "/" ? location.pathname === "/" : item.matchPrefixes.some((p) => location.pathname.startsWith(p));

  return (
    <div className={`w-[66px] shrink-0 border-r flex flex-col items-center py-3 gap-1.5 ${surfaceClass}`}>
      {ITEMS.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(resolveTarget(item))}
            title={item.label}
            className={`relative w-[46px] h-[46px] rounded-full grid place-items-center transition-colors ${
              active ? "bg-primary-soft text-primary-light" : `${faintClass} ${hoverClass}`
            }`}
          >
            {active && <span className="absolute -left-3 top-[11px] bottom-[11px] w-[3px] rounded-full bg-primary" />}
            <Icon size={23} weight={active ? "fill" : "regular"} />
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={onOpenSettings}
        title="Configurações"
        className={`w-[46px] h-[46px] rounded-full grid place-items-center transition-colors ${faintClass} ${hoverClass}`}
      >
        <GearSix size={23} />
      </button>

      {churchInitial && (
        <div
          className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-bold text-xs mt-1"
          style={{ background: "linear-gradient(135deg, #7a1622, #f97316)" }}
        >
          {churchInitial}
        </div>
      )}
    </div>
  );
}
