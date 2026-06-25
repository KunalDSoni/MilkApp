/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Premium design system (slate + indigo). Structured so a future
        // dark-mode pass can swap these values behind the same token names. ──
        primary: { DEFAULT: "#0F172A", soft: "#1E293B" },
        secondary: "#1E293B",
        accent: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          soft: "#EFF4FF",
        },
        success: { DEFAULT: "#10B981", soft: "#ECFDF5" },
        warning: { DEFAULT: "#F59E0B", soft: "#FFFBEB" },
        danger: { DEFAULT: "#EF4444", soft: "#FEF2F2" },

        // Backwards-compatible aliases — existing classes (`brand`, `ink`,
        // `surface`) keep working but now render the new palette so the whole
        // app re-skins from these tokens.
        brand: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#EFF4FF",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
        },
        border: "#E2E8F0",
      },
      borderRadius: {
        card: "16px",
        xl: "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
        extrabold: ["Inter_800ExtraBold"],
      },
      boxShadow: {
        card: "0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)",
        elevated: "0px 8px 24px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
