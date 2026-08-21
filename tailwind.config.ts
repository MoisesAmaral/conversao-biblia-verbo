import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial do UI/UX de referência (Landing Page Vendas)
        ink: "#15171e",
        body: "#3f4552",
        dim: "#6b7280",
        faint: "#98a0ad",
        paper: "#f7f6f2",
        paper2: "#efede7",
        line: "#e4e1d8",
        card: "#ffffff",
        // Vinho — mesmo acento usado no app (desktop + web) e ligado à identidade
        // da 123devs, pra loja e produto lerem como a mesma coisa. Dourado segue
        // reservado só pro CTA de compra (funil precisa de um tom que não seja o
        // mesmo da marca); navy alinhado ao preto do app.
        accent: "#7a1622",
        accent2: "#b23a45",
        accsoft: "#f6e2e4",
        navy: "#0a0a0d",
        navy2: "#131316",
        gold: "#c99a3f",
        live: "#e6394f",
        ok: "#1a9d68",
      },
      boxShadow: {
        btn: "0 10px 26px -8px rgba(122,22,34,.55)",
        "btn-gold": "0 10px 26px -8px rgba(201,154,63,.55)",
        panel: "0 40px 90px -30px rgba(0,0,0,.8)",
        card: "0 30px 70px -28px rgba(12,14,26,.5)",
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "-apple-system", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        blink: "blink 1.4s infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".35" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
