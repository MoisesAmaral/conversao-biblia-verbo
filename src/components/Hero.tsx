import { motion } from "framer-motion";
import { ArrowRight, Broadcast, PlayCircle, SealCheck } from "@phosphor-icons/react";
import { benefits, checkoutUrl, demoUrl, trustBadges } from "../data/site";
import { ProductMockup } from "./ProductMockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-dark-bg text-white">
      {/* brilho índigo sutil ao fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-4 py-2 text-sm font-bold text-primary-light">
            <Broadcast className="h-4 w-4 text-primary-light" />
            Projeção bíblica para igrejas · App para Windows
          </div>

          <h1 className="font-display mt-7 max-w-3xl text-5xl font-bold leading-[1.08] md:text-6xl">
            Apresente a Palavra de Deus com a{" "}
            <span className="text-primary-light">excelência</span> que ela merece.
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-9 text-dark-text-secondary">
            A Bíblia Verbo projeta versículos, hinos da Harpa Cristã e apresentações da sua
            igreja na TV ou no telão em segundos — com o modelo Preview/Programa de um
            switcher profissional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={checkoutUrl}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-base font-black text-white shadow-glow transition hover:bg-primary-dark"
            >
              Quero na minha igreja
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href={demoUrl}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-dark-border2 px-7 text-base font-black text-white transition hover:border-primary/50 hover:bg-dark-card"
            >
              <PlayCircle className="h-5 w-5 text-primary-light" />
              Ver demonstração
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {trustBadges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 text-sm text-primary-light">
                <SealCheck className="h-4 w-4 text-success" weight="fill" />
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-9 grid gap-3 border-t border-dark-border pt-8 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 text-sm font-semibold text-dark-text-secondary"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                {benefit}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="lg:translate-x-4"
        >
          <ProductMockup />
        </motion.div>
      </div>
      <div className="h-20 bg-gradient-to-b from-dark-bg to-light-bg" />
    </section>
  );
}
