/**
 * Centralized design tokens for imperative consumers (icon `color` props,
 * ActivityIndicator, shadows) that can't use Tailwind classes. Keep in sync
 * with tailwind.config.js. Structured for a future dark-mode swap.
 */
export const colors = {
  primary: "#0F172A",
  secondary: "#1E293B",
  accent: "#2563EB",
  accentDark: "#1D4ED8",
  accentSoft: "#EFF4FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#64748B",
  textSubtle: "#94A3B8",
  white: "#FFFFFF",
} as const;

/** Soft, premium card elevation usable as a RN style object. */
export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

/** 4-based spacing scale (4/8/12/16/24/32/40). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
} as const;
