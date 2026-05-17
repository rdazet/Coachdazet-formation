import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2B5E",
          50: "#EEF0F7",
          100: "#CDD2E9",
          200: "#9BA5D3",
          300: "#6978BC",
          400: "#374BA6",
          500: "#1B2B5E",
          600: "#16234C",
          700: "#101A3A",
          800: "#0B1228",
          900: "#050916",
        },
        terracotta: {
          DEFAULT: "#C0603A",
          50: "#FBF0EC",
          100: "#F4D5C8",
          200: "#E8AA91",
          300: "#DC805A",
          400: "#C0603A",
          500: "#9A4D2F",
          600: "#753A23",
          700: "#4F2718",
          800: "#2A140C",
          900: "#050200",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Bricolage Grotesque", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
