import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "ram-crimson": "#C2002F",
        "ram-green": "#005C2E",
        "ram-gold": "#C9A84C",
        "ram-navy": "#0A0C16",
        "ram-surface": "#171B2E",
        "ram-border": "#2A2F4A",
      },
      fontFamily: {
        display: ['"Libre Baskerville"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
