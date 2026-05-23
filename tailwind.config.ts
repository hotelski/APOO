import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#24211f",
        paper: "#fffaf3",
        clay: "#b8614b",
        moss: "#6c7b5f",
        tide: "#2d6f73",
        blush: "#e9b8a6",
        night: "#171b24",
        dusk: "#222733",
        ivory: "#f3eee6",
        muted: "#a9a49d",
        line: "rgba(243, 238, 230, 0.18)",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(36, 33, 31, 0.12)",
        lift: "0 12px 30px rgba(36, 33, 31, 0.12)",
        nocturne: "0 24px 80px rgba(0, 0, 0, 0.34)",
      },
    },
  },
  plugins: [],
};

export default config;
