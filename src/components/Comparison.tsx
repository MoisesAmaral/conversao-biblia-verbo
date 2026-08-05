import { CheckCircle, X } from "@phosphor-icons/react";
import { comparisonRows } from "../data/site";
import { SectionHeader } from "./SectionHeader";

export function Comparison() {
  return (
    <section className="bg-paper px-5 pb-16 md:pb-24 lg:px-10">
      <SectionHeader
        eyebrow="Por que escolher"
        title="Não é apenas leitura. É apresentação."
        description="Apps de Bíblia comuns foram feitos para o celular de cada pessoa. A Bíblia Verbo resolve o momento ao vivo da igreja: projeção clara e operação simples."
      />

      <div className="mx-auto mt-11 max-w-[900px] overflow-hidden rounded-[18px] border border-line bg-card">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-navy text-white md:grid-cols-[1.6fr_1fr_1fr]">
          <p className="px-4 py-4 text-[13px] font-bold md:px-6 md:text-sm">Recurso</p>
          <p className="px-2 py-4 text-center text-[13px] font-bold text-[#9aa2b3] md:px-3 md:text-sm">
            Outras Bíblias
          </p>
          <p className="bg-accent px-2 py-4 text-center text-[13px] font-extrabold md:px-3 md:text-sm">
            Bíblia Verbo
          </p>
        </div>
        {comparisonRows.map(([label, others]) => (
          <div
            key={label as string}
            className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-t border-line md:grid-cols-[1.6fr_1fr_1fr]"
          >
            <p className="px-4 py-3.5 text-[13px] font-semibold text-ink md:px-6 md:text-[14.5px]">
              {label}
            </p>
            <p className="px-2 py-3.5 text-center md:px-3">
              {others === false ? (
                <X className="mx-auto h-[19px] w-[19px] text-faint" />
              ) : (
                <span className="text-xs italic text-dim">{others}</span>
              )}
            </p>
            <p className="self-stretch content-center bg-accent/5 px-2 py-3.5 text-center md:px-3">
              <CheckCircle className="mx-auto h-5 w-5 text-ok" weight="fill" />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
