import { Text as RNText, TextProps } from "react-native";
import { cn } from "@/lib/cn";

type Variant = "h1" | "h2" | "title" | "body" | "label" | "muted" | "caption";

const styles: Record<Variant, string> = {
  h1: "text-3xl font-bold text-ink",
  h2: "text-2xl font-bold text-ink",
  title: "text-lg font-semibold text-ink",
  body: "text-base text-ink",
  label: "text-base font-medium text-ink",
  muted: "text-base text-ink-muted",
  caption: "text-sm text-ink-subtle",
};

interface AppTextProps extends TextProps {
  variant?: Variant;
  className?: string;
}

export function Txt({ variant = "body", className, ...rest }: AppTextProps) {
  return <RNText className={cn(styles[variant], className)} {...rest} />;
}
