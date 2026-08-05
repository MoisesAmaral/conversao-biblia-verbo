import { Church, ImageSquare, PaintBrush, SealCheck } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const settings = [
  { icon: ImageSquare, title: "Logo da igreja" },
  { icon: Church, title: "Nome da congregação" },
  { icon: PaintBrush, title: "Tema da apresentação" },
];

export function Personalization() {
  return (
    <section className="bg-light-bg px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <SectionHeader
          align="left"
          eyebrow="Identidade visual"
          title="Cada culto com a marca da sua igreja."
          description="Na primeira instalação, você configura logo, nome e tema visual — uma única vez. A partir daí, toda apresentação sai limpa, elegante e reconhecível para a congregação e para os visitantes."
        />

        <div className="rounded-xl border border-light-border bg-light-card p-6 shadow-soft">
          <div className="rounded-lg bg-dark-surface p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary-light">
                  Configuração inicial
                </p>
                <h3 className="font-display mt-2 text-2xl font-bold">
                  Nome da sua igreja Aqui!
                </h3>
              </div>
              <span className="font-display flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-primary text-center text-xs font-bold leading-tight text-white">
                <span>SEU</span>
                <span>LOGO</span>
              </span>
            </div>

            <div className="mt-8 grid gap-3">
              {settings.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-dark-border bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary-light" />
                    <span className="font-bold">{item.title}</span>
                  </div>
                  <SealCheck className="h-5 w-5 text-success" weight="fill" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
