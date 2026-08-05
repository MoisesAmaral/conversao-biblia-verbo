import { CheckCircle, Image, TextAa } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const checklist = [
  "Logo da igreja em cada slide projetado",
  "4 temas de apresentação prontos",
  "Tipografia pensada para leitura de longe",
];

const themes = [
  "bg-gradient-to-br from-[#161b3a] to-[#0f1226] outline outline-2 outline-offset-2 outline-accent2",
  "bg-[#f4f2ec]",
  "bg-gradient-to-br from-[#0b2a4a] to-[#071627]",
  "bg-gradient-to-br from-[#3a2a12] to-[#241608]",
];

export function Personalization() {
  return (
    <section className="bg-paper px-5 py-16 md:py-24 lg:px-10">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-[60px]">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Identidade visual"
            title="Cada culto com a marca da sua igreja."
            description="Na primeira instalação, você configura logo, nome e tema visual — uma única vez. A partir daí, toda apresentação sai limpa, elegante e reconhecível para a congregação e para os visitantes."
          />
          <div className="mt-7 flex flex-col gap-3.5">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="h-[22px] w-[22px] shrink-0 text-ok" weight="fill" />
                <span className="text-[15px] font-semibold text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* cartão de configuração inicial */}
        <div className="rounded-[18px] bg-navy p-5 shadow-card sm:p-6">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[.12em] text-accent2">
            Configuração inicial
          </p>
          <div className="mb-4 flex aspect-video flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#161b3a] to-[#0f1226] p-6 text-center">
            <span className="mb-3 grid h-[46px] w-[46px] place-items-center rounded-[10px] border border-dashed border-white/30 bg-white/10 font-mono text-[9px] font-bold leading-tight text-white/60">
              SEU
              <br />
              LOGO
            </span>
            <p className="text-lg font-extrabold text-white">Nome da sua Igreja</p>
            <p className="mt-1.5 font-serif text-xs text-white/70">
              "A Palavra apresentada com excelência"
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 rounded-[9px] bg-white/5 px-3.5 py-2.5">
              <Image className="h-4 w-4 text-accent2" />
              <span className="text-[13px] text-[#c7cede]">Logo da igreja</span>
              <span className="ml-auto text-[11px] text-[#8b94a3]">Enviar…</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-[9px] bg-white/5 px-3.5 py-2.5">
              <TextAa className="h-4 w-4 text-accent2" />
              <span className="text-[13px] text-[#c7cede]">Nome da congregação</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] text-[#8b94a3]">Tema:</span>
              {themes.map((theme) => (
                <span key={theme} className={`h-[30px] w-[30px] rounded-[7px] ${theme}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
