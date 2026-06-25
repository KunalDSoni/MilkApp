import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { otpSchema } from "@/features/auth/schemas";
import { useRequestOtp, useVerifyOtp } from "@/features/auth/hooks";
import { useAuth } from "@/core/auth/useAuth";
import { normalizeError } from "@/core/api/errors";
import { env } from "@/core/config/env";
import { cn } from "@/lib/cn";

const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signIn } = useAuth();
  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const onVerify = (code: string) => {
    Keyboard.dismiss();
    const result = otpSchema.safeParse(code);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    verifyOtp.mutate(
      { phone: phone ?? "", otp: result.data },
      {
        onSuccess: async (res) => {
          await signIn(res);
          router.replace("/(app)/(tabs)");
        },
        onError: (err) => setError(normalizeError(err).message),
      },
    );
  };

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(digits);
    if (error) setError(null);
    if (digits.length === OTP_LENGTH) onVerify(digits);
  };

  const onResend = () => {
    if (secondsLeft > 0 || !phone) return;
    requestOtp.mutate(phone, { onSuccess: () => setSecondsLeft(RESEND_SECONDS) });
    setOtp("");
  };

  return (
    <ScreenContainer scroll className="gap-8 bg-surface-muted">
      <View className="gap-3 pt-14">
        <Txt variant="h1">Verify number</Txt>
        <Txt variant="bodyLg" className="text-ink-muted">
          Enter the 6-digit code sent to{"\n"}
          <Txt variant="bodyLg" className="text-ink" style={{ fontFamily: "Inter_600SemiBold" }}>
            +91 {phone}
          </Txt>
        </Txt>
        {env.useMocks ? (
          <View className="self-start rounded-full bg-warning-soft px-3 py-1.5">
            <Txt variant="caption" className="text-warning">
              Mock mode — use code 123456
            </Txt>
          </View>
        ) : null}
      </View>

      {/* Hidden input drives visible boxes for minimal-typing UX. */}
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View className="flex-row justify-between gap-2">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => {
            const active = otp.length === i;
            const filled = otp[i] != null;
            return (
              <View
                key={i}
                className={cn(
                  "h-16 flex-1 items-center justify-center rounded-2xl border-2",
                  error
                    ? "border-danger bg-danger-soft"
                    : active
                      ? "border-accent bg-accent-soft"
                      : filled
                        ? "border-border bg-surface"
                        : "border-border bg-surface-muted",
                )}
              >
                <Txt variant="h2">{otp[i] ?? ""}</Txt>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={onChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          className="absolute h-px w-px opacity-0"
        />
      </Pressable>

      {error ? (
        <Txt variant="caption" className="text-danger">
          {error}
        </Txt>
      ) : null}

      <Button
        label="Verify"
        onPress={() => onVerify(otp)}
        loading={verifyOtp.isPending}
        disabled={otp.length !== OTP_LENGTH}
      />

      <Pressable onPress={onResend} disabled={secondsLeft > 0} className="py-1">
        <Txt
          variant="label"
          className={cn("text-center", secondsLeft > 0 ? "text-ink-subtle" : "text-accent")}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </Txt>
      </Pressable>
    </ScreenContainer>
  );
}
