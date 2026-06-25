import { Text as RNText, TextProps, TextStyle } from "react-native";
import { cn } from "@/lib/cn";

/**
 * Typographic scale (Inter). Weight is carried by the font family (RN can't
 * synthesize weights for custom fonts), size/line-height/tracking by style,
 * and the default color by a Tailwind class so call sites can override it.
 */
type Variant =
  | "h1" // Heading XL
  | "h2" // Heading L
  | "h3" // Heading M
  | "title"
  | "bodyLg" // Body Large
  | "body" // Body Medium
  | "label"
  | "muted"
  | "caption" // Body Small
  | "overline"
  | "numXl" // financial-grade figure
  | "num";

const FAMILY = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
} as const;

const tabular: TextStyle = { fontVariant: ["tabular-nums"] };

const variants: Record<Variant, { color: string; style: TextStyle }> = {
  h1: { color: "text-ink", style: { fontFamily: FAMILY.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 } },
  h2: { color: "text-ink", style: { fontFamily: FAMILY.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 } },
  h3: { color: "text-ink", style: { fontFamily: FAMILY.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 } },
  title: { color: "text-ink", style: { fontFamily: FAMILY.semibold, fontSize: 17, lineHeight: 24, letterSpacing: -0.2 } },
  bodyLg: { color: "text-ink", style: { fontFamily: FAMILY.regular, fontSize: 17, lineHeight: 26 } },
  body: { color: "text-ink", style: { fontFamily: FAMILY.regular, fontSize: 15, lineHeight: 22 } },
  label: { color: "text-ink", style: { fontFamily: FAMILY.semibold, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 } },
  muted: { color: "text-ink-muted", style: { fontFamily: FAMILY.regular, fontSize: 15, lineHeight: 22 } },
  caption: { color: "text-ink-subtle", style: { fontFamily: FAMILY.medium, fontSize: 13, lineHeight: 18 } },
  overline: { color: "text-ink-subtle", style: { fontFamily: FAMILY.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.8, textTransform: "uppercase" } },
  numXl: { color: "text-ink", style: { fontFamily: FAMILY.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, ...tabular } },
  num: { color: "text-ink", style: { fontFamily: FAMILY.semibold, fontSize: 15, lineHeight: 20, ...tabular } },
};

interface AppTextProps extends TextProps {
  variant?: Variant;
  className?: string;
}

export function Txt({ variant = "body", className, style, ...rest }: AppTextProps) {
  const v = variants[variant];
  return (
    <RNText
      className={cn(v.color, className)}
      style={[v.style, style]}
      maxFontSizeMultiplier={1.4}
      {...rest}
    />
  );
}
