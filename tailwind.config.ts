import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.10)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.25) 0%, rgba(255,255,255,0) 60%)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        fadeUp: "fadeUp 280ms ease-out"
      }
    }
  },
  plugins: []
} satisfies Config;

