import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05010d",
          900: "#090316",
          850: "#0d0620",
          800: "#130a2b",
          700: "#1c1038",
        },
        neon: {
          magenta: "#ff2d95",
          pink: "#ff6ec7",
          cyan: "#00f0ff",
          blue: "#3d7bff",
          purple: "#8b5cf6",
          violet: "#c084fc",
          orange: "#ff8a00",
          amber: "#ffc24b",
          lime: "#a3ff12",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        "neon-cyan": "0 0 25px rgba(0,240,255,.35), 0 0 60px rgba(0,240,255,.12)",
        "neon-pink": "0 0 25px rgba(255,45,149,.35), 0 0 60px rgba(255,45,149,.12)",
        "neon-orange": "0 0 25px rgba(255,138,0,.35), 0 0 60px rgba(255,138,0,.12)",
        glass: "inset 0 1px 0 rgba(255,255,255,.08), 0 24px 60px -30px rgba(0,0,0,.9)",
      },
      backgroundImage: {
        "grid-neon":
          "linear-gradient(rgba(0,240,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,149,.07) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse at center, rgba(139,92,246,.28) 0%, transparent 68%)",
        "fest-gradient":
          "linear-gradient(110deg, #ff2d95 0%, #ff8a00 28%, #ffc24b 45%, #00f0ff 72%, #8b5cf6 100%)",
      },
      backgroundSize: {
        "grid-md": "56px 56px",
        "grid-sm": "28px 28px",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(2deg)" },
        },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(4%, -5%, 0) scale(1.08)" },
          "66%": { transform: "translate3d(-4%, 4%, 0) scale(.96)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.55", filter: "blur(60px)" },
          "50%": { opacity: "0.95", filter: "blur(80px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "45%": { opacity: "1" },
          "47%": { opacity: ".55" },
          "49%": { opacity: "1" },
          "72%": { opacity: ".8" },
        },
        ticker: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        "marquee-reverse": "marquee-reverse 32s linear infinite",
        shimmer: "shimmer 6s linear infinite",
        "pulse-glow": "pulse-glow 9s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        flicker: "flicker 6s linear infinite",
        "spin-slow": "spin 24s linear infinite",
        "fade-in": "fade-in 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
