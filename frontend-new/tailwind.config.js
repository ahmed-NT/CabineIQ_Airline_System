/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--color-border) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        ram: {
          red: "#C41E3A",
          green: "#006233",
          gold: "#C9A84C",
          navy: "#1A1A2E",
        },
        globe: {
          bg: "#07162c",
          rail: "#071628",
          card: "#071628",
          border: "#1a3050",
          topbar: "#0a1e38",
          hover: "#0d2040",
          accent: "#38bdf8",
          purple: "#a78bfa",
          amber: "#fbbf24",
          green: "#4ade80",
          red: "#f87171",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

