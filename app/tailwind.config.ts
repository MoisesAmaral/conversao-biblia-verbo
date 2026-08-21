import type { Config } from "tailwindcss";

// Portado 1:1 do app desktop (biblia-verbo-desktop/tailwind.config.js) para as
// duas telas lerem como o mesmo produto — mesma paleta Rocketseat (roxo +
// quase-preto), mesma tipografia, mesmas sombras.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#0a0a0d",
        "dark-bg-secondary": "#070708",
        "dark-surface": "#131316",
        "dark-card": "#18181c",
        "dark-card2": "#202024",
        "dark-border": "#26262b",
        "dark-border2": "#333338",
        "dark-text-primary": "#f4f4f5",
        "dark-text-secondary": "#a1a1aa",
        "dark-text-muted": "#71717a",

        "light-bg": "#eef0f4",
        "light-bg-secondary": "#e5e8ee",
        "light-surface": "#ffffff",
        "light-card": "#ffffff",
        "light-card2": "#f6f7f9",
        "light-border": "#e1e4ea",
        "light-border2": "#d0d5dd",
        "light-text-primary": "#1a2028",
        "light-text-secondary": "#5a6472",
        "light-text-muted": "#8b95a3",

        primary: "#7a1622",
        "primary-dark": "#4f0e17",
        "primary-light": "#b23a45",
        "primary-soft": "#23100f",
        success: "#20b381",
        warning: "#d99a35",
        danger: "#e6394f",
        info: "#5a8db0",
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "-apple-system", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.5px" }],
        sm: ["13px", { lineHeight: "20px", letterSpacing: "0px" }],
        base: ["14px", { lineHeight: "24px", letterSpacing: "0px" }],
        lg: ["16px", { lineHeight: "28px", letterSpacing: "0px" }],
        xl: ["18px", { lineHeight: "32px", letterSpacing: "-0.5px" }],
        "2xl": ["24px", { lineHeight: "36px", letterSpacing: "-1px" }],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        base: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        "dark-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
        "dark-base": "0 1px 3px 0 rgba(0, 0, 0, 0.3)",
        window: "0 24px 60px -18px rgba(0, 0, 0, 0.7)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
