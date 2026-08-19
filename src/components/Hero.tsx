import { motion } from "framer-motion";
import {
  ChatCircleText,
  Lightning,
  MonitorPlay,
  PlayCircle,
  ShieldCheck,
} from "@phosphor-icons/react";
import { checkoutUrl, demoUrl, featureStrip } from "../data/site";
import { ProductMockup } from "./ProductMockup";

const trust = [
  { icon: ShieldCheck, color: "text-ok", label: "Garantia de 7 dias" },
  { icon: Lightning, color: "text-gold", label: "Ativação imediata" },
  { icon: ChatCircleText, color: "text-accent2", label: "Suporte em português" },
];

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-navy">
      {/* brilhos radiais roxo e dourado, como no design de referência */}
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(1100px_600px_at_78%_-8%,rgba(200,16,46,.32),transparent_60%),radial-gradient(700px_500px_at_8%_110%,rgba(201,154,63,.12),transparent_55%)]"
      />

      <div className="relative mx-auto grid max-w-[1180px] items-center gap-10 px-5 pb-14 pt-12 lg:grid-cols-[1.02fr_1.18fr] lg:gap-14 lg:px-10 lg:pb-20 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-accent2">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-accent2" />
            Projeção bíblica · App para Windows
          </p>

          <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[52px]">
            Apresente a Palavra com a{" "}
            <span className="text-accent2">excelência</span> que ela merece.
          </h1>

          <p className="mt-5 max-w-[540px] text-base leading-relaxed text-[#b9c0d0] md:text-lg">
            Projete versículos, hinos da Harpa Cristã e apresentações da sua
            igreja na TV ou no telão em segundos — com o modelo{" "}
            <b className="text-white">Preview / Programa</b> de um switcher
            profissional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={checkoutUrl}
              className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-gold px-7 py-4 text-base font-bold text-[#1a1406] shadow-btn-gold transition hover:-translate-y-px"
            >
              <MonitorPlay className="h-5 w-5" weight="fill" />
              Quero na minha igreja
            </a>
            <a
              href={demoUrl}
              className="inline-flex items-center justify-center gap-2 rounded-[11px] border border-white/25 px-6 py-4 text-base font-bold text-white transition hover:-translate-y-px"
            >
              <PlayCircle className="h-5 w-5" />
              Ver demonstração
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {trust.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 text-[13px] text-[#aeb6c6]"
              >
                <item.icon className={`h-[17px] w-[17px] ${item.color}`} weight="fill" />
                {item.label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.55 }}
        >
          <ProductMockup />
        </motion.div>
      </div>

      {/* faixa de destaques */}
      <div className="relative border-t border-white/10 bg-white/[.02]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-3 px-5 py-4 min-[480px]:grid-cols-2 lg:flex lg:justify-between lg:gap-6 lg:px-10">
          {featureStrip.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#c7cede]"
            >
              <item.icon className="h-4 w-4 shrink-0 text-accent2" weight="fill" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
