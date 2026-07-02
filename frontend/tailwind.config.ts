import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT:  "hsl(var(--surface))",
          raised:   "hsl(var(--surface-raised))",
          overlay:  "hsl(var(--surface-overlay))",
        },
        card:     { DEFAULT: "hsl(var(--card))",    foreground: "hsl(var(--card-foreground))"    },
        popover:  { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary:  { DEFAULT: "hsl(var(--primary-css))", foreground: "hsl(var(--primary-foreground))" },
        secondary:{ DEFAULT: "hsl(var(--secondary))",   foreground: "hsl(var(--secondary-foreground))" },
        muted:    { DEFAULT: "hsl(var(--muted))",        foreground: "hsl(var(--muted-foreground))" },
        accent:   { DEFAULT: "hsl(var(--accent-css))",   foreground: "hsl(var(--accent-foreground))", glow: "hsl(var(--accent-glow-css))" },
        success:  { DEFAULT: "hsl(var(--success-css))",  foreground: "hsl(var(--success-foreground))", dim: "hsl(var(--success-dim))" },
        warning:  { DEFAULT: "hsl(var(--warning-css))",  foreground: "hsl(var(--warning-foreground))", dim: "hsl(var(--warning-dim))" },
        danger:   { DEFAULT: "hsl(var(--danger-css))",   foreground: "hsl(var(--danger-foreground))",  dim: "hsl(var(--danger-dim))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border-css))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)",  "JetBrains Mono", "monospace"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "20px",
        "2xl": "24px",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(0,180,216,0.3)",
        "glow-md": "0 0 24px rgba(0,180,216,0.4)",
        "glow-lg": "0 0 48px rgba(0,180,216,0.3)",
        "panel":   "0 8px 40px rgba(0,0,0,0.6)",
        "card":    "0 2px 8px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in":   "fade-in 0.3s ease-out",
        "glow-pulse":"glow-pulse 2s ease-in-out infinite",
        "shimmer":   "shimmer 1.5s infinite",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,180,216,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "44px 44px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
