/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0C",
        paper: "#FAFAF8",
        slate: "#1C1C1F",
        muted: "#6B6B70",
        hairline: "#E8E6E1",
        moss: {
          DEFAULT: "#4A5D4E",
          light: "#5E7563",
          dark: "#384538",
        },
      },
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        paper: "0 1px 2px rgba(10,10,12,0.04), 0 12px 32px -16px rgba(10,10,12,0.18)",
        soft: "0 1px 2px rgba(10,10,12,0.06)",
      },
      keyframes: {
        "ink-flow": {
          "0%": { strokeDashoffset: "240" },
          "100%": { strokeDashoffset: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "check-draw": {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "ink-flow": "ink-flow 1.1s ease forwards",
        "fade-up": "fade-up 0.35s ease forwards",
        "check-draw": "check-draw 0.5s ease 0.15s forwards",
      },
    },
  },
  plugins: [],
};
