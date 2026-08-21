import { ElementType, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Broadcast, ArrowsOut, X, ArrowLeft, Palette, TextAa,
  Keyboard, UserCircle, CaretDown, Moon, Sun, Waves, ScrollIcon,
} from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

type Section = "screens" | "themes" | "fonts" | "shortcuts" | "account";

const SECTIONS: { key: Section; label: string; icon: ElementType }[] = [
  { key: "screens", label: "Telas & saída", icon: Broadcast },
  { key: "themes", label: "Temas de projeção", icon: Palette },
  { key: "fonts", label: "Fontes", icon: TextAa },
  { key: "shortcuts", label: "Atalhos", icon: Keyboard },
  { key: "account", label: "Conta", icon: UserCircle },
];

const THEME_OPTIONS = [
  { key: "dark", label: "Escuro", icon: Moon, color: "from-gray-700 to-gray-900" },
  { key: "light", label: "Claro", icon: Sun, color: "from-yellow-200 to-yellow-300" },
  { key: "blue", label: "Azul", icon: Waves, color: "from-blue-600 to-blue-800" },
  { key: "sepia", label: "Sépia", icon: ScrollIcon, color: "from-amber-700 to-amber-900" },
] as const;

const SHORTCUTS = [
  { keys: "Espaço", desc: "Ir ao ar com o item em preview" },
  { keys: "← / →", desc: "Navegar slides (na janela de apresentação)" },
  { keys: "Esc", desc: "Fechar a janela de apresentação" },
  { keys: "Ctrl + S", desc: "Salvar apresentação no editor" },
  { keys: "Ctrl + K", desc: "Focar a busca rápida na Início" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${checked ? "bg-primary" : "bg-dark-border2"}`}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: checked ? "translateX(22px)" : "translateX(3px)" }} />
    </button>
  );
}

export default function Settings() {
  const { theme } = useTheme();
  const { session, signOut } = useAuth();
  const { profile, refreshProfile, presentationActive, openPresentation, closePresentation, toggleFullscreen } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("screens");

  const [safeMargins, setSafeMargins] = useState(profile?.safe_margins ?? true);
  const [autoFitFont, setAutoFitFont] = useState(profile?.auto_fit_font ?? true);
  const [transition, setTransition] = useState<"fade" | "none">(profile?.transition ?? "fade");
  const [defaultTheme, setDefaultTheme] = useState(profile?.default_theme ?? "dark");
  const [defaultFontSize, setDefaultFontSize] = useState(profile?.default_font_size ?? 72);

  const persist = async (patch: Record<string, unknown>) => {
    if (!session) return;
    await supabase.from("profiles").update(patch).eq("id", session.user.id);
    refreshProfile();
  };

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const railBg = theme === "dark" ? "bg-dark-surface" : "bg-light-surface";

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className={`border-b ${headerClass} px-6 py-3.5 shrink-0`}>
        <button onClick={() => navigate("/")} className={`inline-flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-sm font-medium transition ${chipClass}`}>
          <ArrowLeft size={14} />
          Início
        </button>
      </div>

      <div className="flex-1 min-h-0 flex">
        <div className={`w-[210px] shrink-0 border-r ${headerClass} ${railBg} p-2.5`}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition ${
                  active ? "bg-primary/15 border border-primary/40 text-primary font-semibold" : `border border-transparent ${mutedClass} ${theme === "dark" ? "hover:bg-dark-card" : "hover:bg-light-card2"}`
                }`}
              >
                <Icon size={16} />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-7">
          <div className="max-w-2xl">
            {section === "screens" && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold">Telas & saída</h1>
                  <p className={`text-xs mt-1 ${mutedClass}`}>Controle a janela da Tela 2 (arraste-a para o projetor e coloque em tela cheia).</p>
                </div>

                <div className={`rounded-xl border p-5 mb-6 ${cardClass}`}>
                  <h3 className="font-bold text-sm mb-1">Janela de apresentação</h3>
                  <p className={`text-xs mb-4 ${mutedClass}`}>
                    Abre uma nova janela — arraste para o segundo monitor/projetor e use "Tela cheia".
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => (presentationActive ? closePresentation() : openPresentation())}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition flex items-center gap-2"
                    >
                      <Broadcast size={15} weight={presentationActive ? "fill" : "regular"} />
                      {presentationActive ? "Apresentação aberta" : "Abrir apresentação"}
                    </button>
                    <button onClick={toggleFullscreen} className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${chipClass}`}>
                      <ArrowsOut size={15} />
                      Alternar tela cheia
                    </button>
                    {presentationActive && (
                      <button onClick={closePresentation} className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${chipClass}`}>
                        <X size={15} />
                        Fechar
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Margens de segurança</p>
                      <p className={`text-xs ${mutedClass}`}>Evita corte nas bordas do projetor</p>
                    </div>
                    <Toggle
                      checked={safeMargins}
                      onChange={(v) => {
                        setSafeMargins(v);
                        persist({ safe_margins: v });
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Ajuste automático da fonte</p>
                      <p className={`text-xs ${mutedClass}`}>Reduz textos longos para caberem na tela</p>
                    </div>
                    <Toggle
                      checked={autoFitFont}
                      onChange={(v) => {
                        setAutoFitFont(v);
                        persist({ auto_fit_font: v });
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Transição entre slides</p>
                      <p className={`text-xs ${mutedClass}`}>{transition === "fade" ? "Fade suave · 400ms" : "Corte instantâneo"}</p>
                    </div>
                    <div className={`relative rounded-lg text-xs font-semibold ${chipClass}`}>
                      <select
                        value={transition}
                        onChange={(e) => {
                          const v = e.target.value as "fade" | "none";
                          setTransition(v);
                          persist({ transition: v });
                        }}
                        className="appearance-none bg-transparent pl-3 pr-8 py-2 outline-none cursor-pointer"
                      >
                        <option value="fade">Fade</option>
                        <option value="none">Nenhuma</option>
                      </select>
                      <CaretDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {section === "themes" && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold">Temas de projeção</h1>
                  <p className={`text-xs mt-1 ${mutedClass}`}>Escolha o tema padrão ao abrir a janela de apresentação.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {THEME_OPTIONS.map((t) => {
                    const Icon = t.icon;
                    const active = defaultTheme === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => {
                          setDefaultTheme(t.key);
                          persist({ default_theme: t.key });
                        }}
                        className={`p-4 rounded-xl transition-all ${active ? `bg-gradient-to-r ${t.color} text-white shadow-md` : `border ${cardClass} hover:opacity-80`}`}
                      >
                        <Icon size={22} className="mx-auto mb-2" />
                        <span className="text-sm font-semibold block">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {section === "fonts" && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold">Fontes</h1>
                  <p className={`text-xs mt-1 ${mutedClass}`}>Tamanho inicial do texto ao abrir uma nova apresentação.</p>
                </div>
                <div className={`rounded-xl border p-5 ${cardClass}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold">A</span>
                    <input
                      type="range"
                      min={32}
                      max={120}
                      step={4}
                      value={defaultFontSize}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setDefaultFontSize(v);
                        persist({ default_font_size: v });
                      }}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-lg font-bold">A</span>
                  </div>
                  <p className={`text-center text-xs font-mono mt-2 ${mutedClass}`}>{defaultFontSize}px</p>
                </div>
              </>
            )}

            {section === "shortcuts" && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold">Atalhos de teclado</h1>
                  <p className={`text-xs mt-1 ${mutedClass}`}>Acelere a operação durante o culto.</p>
                </div>
                <div className={`rounded-xl border divide-y ${cardClass} ${theme === "dark" ? "divide-dark-border" : "divide-light-border"}`}>
                  {SHORTCUTS.map((s) => (
                    <div key={s.keys} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm">{s.desc}</span>
                      <span className={`font-mono text-[11px] px-2.5 py-1 rounded-md shrink-0 ml-4 ${chipClass}`}>{s.keys}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {section === "account" && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold">Conta</h1>
                  <p className={`text-xs mt-1 ${mutedClass}`}>Sua conta na Bíblia Verbo.</p>
                </div>
                <div className={`rounded-xl border p-5 ${cardClass}`}>
                  <p className="text-sm font-semibold mb-5">{session?.user.email}</p>
                  <button
                    onClick={() => {
                      if (!confirm("Sair da sua conta neste dispositivo?")) return;
                      signOut();
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-danger/15 text-danger hover:bg-danger/25 transition"
                  >
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
