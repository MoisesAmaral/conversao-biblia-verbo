import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Identidade Bíblia Verbo — mesma paleta "cabine de som" do app desktop
        'dark-bg': '#0e1117',
        'dark-bg-secondary': '#0a0c10',
        'dark-surface': '#141922',
        'dark-card': '#1a2029',
        'dark-card2': '#222a35',
        'dark-border': '#262e39',
        'dark-border2': '#37414e',
        'dark-text-primary': '#e9edf3',
        'dark-text-secondary': '#98a2b1',
        'dark-text-muted': '#69727f',

        'light-bg': '#eef0f4',
        'light-bg-secondary': '#e5e8ee',
        'light-surface': '#ffffff',
        'light-card': '#ffffff',
        'light-card2': '#f6f7f9',
        'light-border': '#e1e4ea',
        'light-border2': '#d0d5dd',
        'light-text-primary': '#1a2028',
        'light-text-secondary': '#5a6472',
        'light-text-muted': '#8b95a3',

        'primary': '#6d5aed',
        'primary-dark': '#5a49e6',
        'primary-light': '#a99bff',
        'primary-soft': '#211f39',
        'success': '#20b381',
        'warning': '#d99a35',
        'danger': '#ef4463',
        'info': '#5a8db0',
      },
      boxShadow: {
        soft: "0 18px 60px rgba(14, 17, 23, 0.10)",
        glow: "0 20px 80px rgba(109, 90, 237, 0.30)",
        halo: "0 0 0 1px rgba(109, 90, 237, 0.35), 0 24px 90px rgba(10, 12, 16, 0.55)",
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "-apple-system", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
