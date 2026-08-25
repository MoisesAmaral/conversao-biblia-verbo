import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowsOut,
  BookOpenText,
  Broadcast,
  CaretLeft,
  CaretRight,
  CloudArrowDown,
  DownloadSimple,
  FolderOpen,
  Folders,
  MagnifyingGlass,
  PencilSimple,
  Play,
  Plus,
  Square,
  Trash,
} from "@phosphor-icons/react";
import { bibleVersions } from "../data/site";

const themeSwatches = [
  "bg-gradient-to-br from-[#161b3a] to-[#0f1226] outline outline-2 outline-offset-2 outline-accent2",
  "bg-[#f4f2ec]",
  "bg-gradient-to-br from-[#0b2a4a] to-[#071627]",
  "bg-gradient-to-br from-[#3a2a12] to-[#241608]",
];

const tabs = [
  { key: "ao-vivo", label: "Ao vivo", icon: Broadcast },
  { key: "biblia", label: "Bíblia", icon: BookOpenText },
  { key: "departamentos", label: "Departamentos", icon: Folders },
  { key: "offline", label: "Versões offline", icon: CloudArrowDown },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const crumbs: Record<TabKey, string> = {
  "ao-vivo": "Ao vivo · Buscar",
  biblia: "Bíblia",
  departamentos: "Departamentos",
  offline: "Downloads",
};

export function AppTour() {
  const [active, setActive] = useState<TabKey>("ao-vivo");

  return (
    <div>
      {/* seletor de telas */}
      <div className="mx-auto mb-5 flex max-w-full flex-wrap justify-center gap-2">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                isActive
                  ? "border-accent2 bg-accent2 text-white"
                  : "border-white/15 bg-white/[.04] text-[#c7cede] hover:border-white/30"
              }`}
            >
              <tab.icon className="h-4 w-4" weight={isActive ? "fill" : "regular"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* moldura do app */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0d] shadow-panel">
        <div className="flex h-[38px] items-center gap-2.5 border-b border-white/5 bg-[#131316] px-3.5">
          <span className="flex gap-1.5">
            <span className="h-[9px] w-[9px] rounded-full bg-white/15" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/15" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/15" />
          </span>
          <span className="truncate text-xs font-semibold text-[#c7cede]">
            Bíblia Verbo Desktop <span className="text-[#5b6272]">— {crumbs[active]}</span>
          </span>
        </div>

        <div className="min-h-[420px] p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {active === "ao-vivo" && <AoVivoScreen />}
              {active === "biblia" && <BibliaScreen />}
              {active === "departamentos" && <DepartamentosScreen />}
              {active === "offline" && <OfflineScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AoVivoScreen() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h3 className="text-lg font-extrabold text-white sm:text-xl">
          O que vamos apresentar?
        </h3>
        <p className="mt-1 text-[13px] text-[#8b94a3]">
          Digite uma referência, um número de hino ou o nome de um slide.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent2/60 bg-white/[.03] px-3.5 py-3">
          <MagnifyingGlass className="h-4 w-4 shrink-0 text-accent2" />
          <span className="truncate text-[13px] text-[#8b94a3]">
            João 3:16, 21, Chuvas de bênção…
          </span>
          <span className="ml-auto shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold text-[#8b94a3]">
            Enter
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-semibold text-[#8b94a3]">
          <span className="text-accent2">Referência</span>
          <span>Palavra</span>
          <span>Hino</span>
          <span>Slide</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { icon: BookOpenText, label: "Bíblia" },
            { icon: Broadcast, label: "Harpa" },
            { icon: Folders, label: "Slides" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] py-4"
            >
              <item.icon className="h-5 w-5 text-accent2" />
              <span className="text-[12px] font-bold text-[#c7cede]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[.02] p-3.5">
        <p className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[.1em] text-[#8b94a3]">
          Ao vivo
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[#5b6272]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#5b6272]" />
            Fechada
          </span>
        </p>

        <p className="mb-1.5 mt-3 font-mono text-[9px] tracking-widest text-[#5b6272]">
          PROGRAMA · TELA 2
        </p>
        <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-white/10 text-[11px] text-[#5b6272]">
          Nada no ar
        </div>

        <p className="mb-1.5 mt-3 font-mono text-[9px] tracking-widest text-live">
          PREVIEW · A SEGUIR
        </p>
        <div className="flex aspect-video items-center justify-center rounded-lg border border-live/40 text-center text-[11px] text-[#5b6272]">
          Busque algo à esquerda
        </div>

        <button
          disabled
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-3 py-2.5 text-[13px] font-bold text-[#5b6272]"
        >
          <Play className="h-3.5 w-3.5" weight="fill" />
          Ir ao ar
        </button>
      </div>
    </div>
  );
}

function BibliaScreen() {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.65fr_1.15fr_1fr]">
      <div className="hidden flex-col gap-1.5 lg:flex">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#5b6272]">
          Antigo Testamento
        </p>
        {["Gênesis", "Êxodo", "Levítico", "Salmos", "Isaías"].map((book, i) => (
          <span
            key={book}
            className={`rounded-md px-2.5 py-1.5 text-[12px] font-semibold ${
              i === 0 ? "bg-accent2 text-white" : "text-[#8b94a3]"
            }`}
          >
            {book}
          </span>
        ))}
        <p className="mb-1 mt-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#5b6272]">
          Novo Testamento
        </p>
        {["Mateus", "João", "Romanos"].map((book) => (
          <span key={book} className="rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-[#8b94a3]">
            {book}
          </span>
        ))}
      </div>

      <div>
        <p className="flex items-baseline gap-2 text-base font-extrabold text-white">
          Gênesis 1
          <span className="text-[11px] font-semibold text-[#5b6272]">ACF · 31 versículos</span>
        </p>
        <div className="mt-3 space-y-2.5">
          <p className="rounded-lg border-l-2 border-accent2 bg-accent2/10 px-3 py-2 text-[13px] leading-relaxed text-white">
            <b className="mr-1.5 text-accent2">1</b>
            No princípio criou Deus o céu e a terra.
          </p>
          <p className="px-3 text-[13px] leading-relaxed text-[#c7cede]">
            <b className="mr-1.5 text-[#5b6272]">2</b>
            E a terra era sem forma e vazia; e havia trevas sobre a face do
            abismo; e o Espírito de Deus se movia sobre a face das águas.
          </p>
          <p className="px-3 text-[13px] leading-relaxed text-[#c7cede]">
            <b className="mr-1.5 text-[#5b6272]">3</b>E disse Deus: Haja luz; e houve luz.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[.02] p-3.5">
        <p className="mb-1.5 font-mono text-[9px] tracking-widest text-[#5b6272]">PROJEÇÃO</p>
        <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-white/10 text-[11px] text-[#5b6272]">
          Nada no ar
        </div>

        <p className="mb-1.5 mt-3 font-mono text-[9px] tracking-widest text-live">PREVIEW</p>
        <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-live/40 bg-gradient-to-br from-[#161b3a] to-[#0f1226] p-3 text-center">
          <p className="font-serif text-[11px] italic leading-snug text-white">
            "No princípio criou Deus o céu e a terra."
          </p>
          <p className="mt-1.5 font-mono text-[8px] tracking-[1.5px] text-accent2">
            GÊNESIS 1:1
          </p>
        </div>

        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-live px-3 py-2.5 text-[13px] font-bold text-white">
          <Play className="h-3.5 w-3.5" weight="fill" />
          Ir ao ar
        </button>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#8b94a3]">
          <CaretLeft className="h-3.5 w-3.5" />
          1 de 31
          <CaretRight className="h-3.5 w-3.5" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] text-[#5b6272]">Tema:</span>
          {themeSwatches.map((theme) => (
            <span key={theme} className={`h-[22px] w-[22px] rounded-[6px] ${theme}`} />
          ))}
          <ArrowsOut className="ml-auto h-3.5 w-3.5 text-[#5b6272]" />
        </div>
      </div>
    </div>
  );
}

function DepartamentosScreen() {
  const departments = [
    { name: "Jovens", count: "1 apresentação" },
    { name: "EBD", count: "0 apresentações" },
    { name: "Louvor", count: "3 apresentações" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-2.5 rounded-xl border border-white/10 bg-white/[.03] p-3 sm:flex-row sm:items-center">
        <span className="flex-1 text-[13px] text-[#5b6272]">
          Nome do departamento (ex: Jovens, Culto, Crianças…)
        </span>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent2 px-4 py-2 text-[12.5px] font-bold text-white">
          <Plus className="h-3.5 w-3.5" weight="bold" />
          Criar
        </button>
      </div>

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div key={dept.name} className="rounded-xl border border-white/10 bg-white/[.02] p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent2/15 text-accent2">
                <Folders className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-[13.5px] font-extrabold text-white">{dept.name}</p>
                <p className="text-[11px] text-[#5b6272]">{dept.count}</p>
              </div>
            </div>
            <div className="mt-3.5 flex items-center gap-2">
              <button className="flex-1 rounded-lg bg-accent2 py-2 text-[12px] font-bold text-white">
                Abrir
              </button>
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#8b94a3]">
                <PencilSimple className="h-3.5 w-3.5" />
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#8b94a3]">
                <Trash className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfflineScreen() {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-white">Versões Offline</h3>
          <p className="mt-1 text-[12.5px] text-[#8b94a3]">
            Baixe versões da Bíblia para usar sem internet. Uma vez baixadas,
            são usadas automaticamente.
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[12px] font-bold text-[#c7cede] sm:inline-flex">
          <FolderOpen className="h-3.5 w-3.5" />
          Abrir pasta
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {bibleVersions.map((version) => (
          <div
            key={version.code}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.02] px-4 py-3.5"
          >
            <span className="w-9 shrink-0 text-[11px] font-black tracking-wide text-accent2">
              {version.code}
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-white">
                {version.name}
                {version.offline && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 text-[10px] font-bold text-ok">
                    <span className="h-[5px] w-[5px] rounded-full bg-ok" />
                    Offline
                  </span>
                )}
              </p>
            </div>
            <button
              className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold ${
                version.offline
                  ? "border border-accent2/40 text-accent2"
                  : "bg-accent2 text-white"
              }`}
            >
              {version.offline ? (
                <>
                  <Trash className="h-3.5 w-3.5" />
                  Remover
                </>
              ) : (
                <>
                  <DownloadSimple className="h-3.5 w-3.5" />
                  Baixar
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
