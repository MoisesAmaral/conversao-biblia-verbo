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
        // Roxo Rocketseat (#8257e5) — o mesmo acento usado no app desktop, para as
        // duas peças (app + página de vendas) lerem como o mesmo produto. Dourado
        // segue como a reverência (CTA principal); navy também intocado.
        accent: "#8257e5",
        accent2: "#6842c2",
        accsoft: "#ece5fb",
        navy: "#0c0e1a",
        navy2: "#12152a",
        gold: "#c99a3f",
        live: "#e23b5c",
        ok: "#1a9d68",
      },
      boxShadow: {
        btn: "0 10px 26px -8px rgba(130,87,229,.55)",
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
