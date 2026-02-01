import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E8F0F7",
          100: "#C5D9EB",
          500: "#1E3A5F",
          600: "#1A3354",
          700: "#152B47",
          900: "#0B1726",
        },
        gold: {
          50: "#FDF9ED",
          500: "#D4AF37",
          600: "#BA9830",
        },
      },
    },
  },
  plugins: [],
};

export default config;
