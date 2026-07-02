import { forwardRef, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Txt } from "./Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: React.ReactNode;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, prefix, suffix, className, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      {label ? (
        <Txt variant="overline" className="text-ink-muted">
          {label}
        </Txt>
      ) : null}
      <View
        className={cn(
          "h-14 flex-row items-center rounded-2xl border bg-surface px-4",
          error
            ? "border-danger bg-danger-soft"
            : focused
              ? "border-accent bg-accent-soft"
              : "border-border bg-surface-muted",
        )}
      >
        {prefix ? (
          <Txt variant="body" className="mr-1.5 text-ink-muted">
            {prefix}
          </Txt>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn("flex-1 text-ink", className)}
          style={{ fontFamily: "Inter_500Medium", fontSize: 16 }}
          {...rest}
        />
        {suffix ? <View className="ml-2">{suffix}</View> : null}
      </View>
      {error ? (
        <Txt variant="caption" className="text-danger">
          {error}
        </Txt>
      ) : null}
    </View>
  );
});
