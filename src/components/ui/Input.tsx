import { forwardRef } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Txt } from "./Text";
import { cn } from "@/lib/cn";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, prefix, className, ...rest },
  ref,
) {
  return (
    <View className="gap-1.5">
      {label ? <Txt variant="label">{label}</Txt> : null}
      <View
        className={cn(
          "h-14 flex-row items-center rounded-2xl border bg-surface px-4",
          error ? "border-danger" : "border-surface-muted",
        )}
      >
        {prefix ? <Txt variant="muted" className="mr-1">{prefix}</Txt> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          className={cn("flex-1 text-lg text-ink", className)}
          {...rest}
        />
      </View>
      {error ? (
        <Txt variant="caption" className="text-danger">
          {error}
        </Txt>
      ) : null}
    </View>
  );
});
