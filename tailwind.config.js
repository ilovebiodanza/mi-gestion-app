/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"], // Para datos encriptados
      },
      colors: {
        // Paleta "Sober & Secure" (La nueva)
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
        slate: {
          850: "#172033",
          900: "#0f172a",
        },
        // --- ALIAS DE COMPATIBILIDAD (Agrega esto) ---
        // Esto hace que "bg-primary" use el nuevo color azul "brand"
        // hasta que terminemos de refactorizar todo el código.
        primary: {
          DEFAULT: "#3b82f6", // Mapeado a brand-500
          hover: "#2563eb", // Mapeado a brand-600
        },
        secondary: "#64748b", // Un gris azulado (slate-500)
        accent: "#0f172a", // Un oscuro (slate-900)
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        input: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "input-focus": "0 0 0 4px rgba(59, 130, 246, 0.15)", // Anillo de foco suave
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
