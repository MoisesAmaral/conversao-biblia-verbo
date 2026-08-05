import { Check, X } from "@phosphor-icons/react";
import { comparisonRows } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function Comparison() {
  return (
    <section className="bg-light-bg px-5 py-24 lg:px-8">
      <SectionHeader
        eyebrow="Por que escolher"
        title="Não é apenas leitura. É apresentação."
        description="Aplicativos de Bíblia comuns foram feitos para o celular de cada pessoa. A Bíblia Verbo resolve o momento ao vivo da igreja — projeção clara e operação simples."
      />

      <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-xl border border-light-border bg-light-card shadow-soft">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] bg-dark-surface p-5 text-sm font-black text-white">
          <span>Recurso</span>
          <span className="text-dark-text-secondary">Outras Bíblias</span>
          <span className="text-primary-light">Bíblia Verbo</span>
        </div>
        {comparisonRows.map(([label, common, verbo]) => (
          <div
            key={label as string}
            className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-t border-light-border p-5 text-sm"
          >
            <span className="font-bold text-light-text-primary">{label}</span>
            <span>
              {common ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <X className="h-5 w-5 text-light-text-muted" />
              )}
            </span>
            <span>
              {verbo ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success/15">
                  <Check className="h-5 w-5 text-success" />
                </span>
              ) : (
                <X className="h-5 w-5 text-light-text-muted" />
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
