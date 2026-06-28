import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        slateText: "#425466",
        line: "#E5E7EB",
        surface: "#F8FAFC",
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          600: "#047857",
          700: "#036749",
          900: "#073B32"
        },
        amberRisk: "#B45309",
        redRisk: "#B91C1C"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(17, 24, 39, 0.10)",
        panel: "0 10px 30px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
