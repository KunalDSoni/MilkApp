import { useState } from "react";
import { Keyboard, View } from "react-native";
import { useRouter } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Txt } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/Banner";
import { useRequestOtp, useResetPassword } from "@/features/auth/hooks";
import { phoneSchema } from "@/features/auth/schemas";
import { colors, shadow } from "@/lib/theme";
import { normalizeError } from "@/core/api/errors";

type Step = "phone" | "reset";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const requestOtp = useRequestOtp();
  const resetPassword = useResetPassword();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendOtp = () => {
    Keyboard.dismiss();
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    requestOtp.mutate(result.data, {
      onSuccess: () => setStep("reset"),
      onError: (err) => setError(normalizeError(err).message),
    });
  };

  const handleReset = () => {
    Keyboard.dismiss();
    if (!code || code.length < 6) {
      setError("Enter the 6-digit code");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError(null);
    resetPassword.mutate(
      { phone, code, newPassword },
      {
        onSuccess: () => {
          router.push({
            pathname: "/(auth)/login",
            params: { resetDone: "true" },
          });
        },
        onError: (err) => setError(normalizeError(err).message),
      },
    );
  };

  return (
    <ScreenContainer scroll className="gap-8 bg-surface-muted">
      <View className="items-center gap-4 pt-16">
        <View
          className="h-20 w-20 items-center justify-center rounded-3xl bg-accent"
          style={shadow.elevated}
        >
          <KeyRound size={40} color={colors.white} strokeWidth={2} />
        </View>
        <View className="items-center gap-2">
          <Txt variant="h1" accessibilityRole="header">
            Reset password
          </Txt>
          <Txt variant="bodyLg" className="text-center text-ink-muted">
            {step === "phone"
              ? "Enter your mobile number to receive a reset code."
              : `Enter the code sent to +91 ${phone} and your new password.`}
          </Txt>
        </View>
      </View>

      {error ? <Banner tone="error" message={error} onDismiss={() => setError(null)} /> : null}

      <Card className="gap-5" variant="elevated">
        {step === "phone" ? (
          <>
            <Input
              label="Mobile number"
              prefix="+91"
              keyboardType="number-pad"
              maxLength={10}
              autoFocus
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
              onSubmitEditing={sendOtp}
              error={error ?? undefined}
              placeholder="10-digit number"
            />
            <Button
              label={requestOtp.isPending ? "Sending..." : "Send reset code"}
              onPress={sendOtp}
              loading={requestOtp.isPending}
              disabled={phone.length !== 10}
            />
          </>
        ) : (
          <>
            <Input
              label="Reset code"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
              placeholder="6-digit code"
            />
            <Input
              label="New password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 6 characters"
            />
            <Button
              label={resetPassword.isPending ? "Resetting..." : "Reset password"}
              onPress={handleReset}
              loading={resetPassword.isPending}
              disabled={code.length < 6 || newPassword.length < 6}
            />
          </>
        )}
      </Card>

      <Button
        label="Back to login"
        variant="ghost"
        onPress={() => router.push("/(auth)/login")}
      />
    </ScreenContainer>
  );
}
