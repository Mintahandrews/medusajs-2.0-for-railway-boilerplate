import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#14b8a6",
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        pos: {
          bg: "var(--pos-bg)",
          "bg-subtle": "var(--pos-bg-subtle)",
          card: "var(--pos-card)",
          border: "var(--pos-border)",
          "border-strong": "var(--pos-border-strong)",
          surface: "var(--pos-surface)",
          muted: "var(--pos-muted)",
          "muted-fg": "var(--pos-muted-fg)",
          accent: "#14b8a6",
          fg: "var(--pos-fg)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "card": "0 1px 2px 0 rgb(0 0 0 / 0.15), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.25)",
        "modal": "0 16px 70px rgb(0 0 0 / 0.5)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}

export default config
