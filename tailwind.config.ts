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
        sand: "#f8f3eb",
        stoneWarm: "#f3eee7",
        ink: "#2f2a24"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(34, 29, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
