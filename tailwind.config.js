/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand: dairy-fresh blue + clean neutrals. Tuned for high contrast
        // and readability on low-end Android displays.
        brand: {
          DEFAULT: "#1565C0",
          dark: "#0D47A1",
          light: "#E3F2FD",
        },
        success: "#2E7D32",
        warning: "#ED6C02",
        danger: "#C62828",
        ink: {
          DEFAULT: "#111827",
          muted: "#6B7280",
          subtle: "#9CA3AF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F3F4F6",
        },
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
