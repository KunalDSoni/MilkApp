import { useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { MilkIcon, Eye, EyeOff, KeyRound, Smartphone } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Txt } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/core/auth/useAuth";
import { colors, shadow } from "@/lib/theme";
import { normalizeError } from "@/core/api/errors";
import { cn } from "@/lib/cn";
import { phoneSchema } from "@/features/auth/schemas";
import { useRequestOtp, useLoginWithPassword } from "@/features/auth/hooks";

type AuthMode = "otp" | "password";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const requestOtp = useRequestOtp();
  const loginPassword = useLoginWithPassword();
  const [mode, setMode] = useState<AuthMode>("otp");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    Keyboard.dismiss();
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);

    if (mode === "otp") {
      requestOtp.mutate(result.data, {
        onSuccess: () => router.push({ pathname: "/(auth)/otp", params: { phone: result.data } }),
        onError: (err) => setError(normalizeError(err).message),
      });
    } else {
      if (!password) {
        setError("Enter your password");
        return;
      }
      loginPassword.mutate(
        { phone: result.data, password },
        {
          onSuccess: async (res) => {
            await signIn(res);
            router.replace("/(app)/(tabs)");
          },
          onError: (err) => setError(normalizeError(err).message),
        },
      );
    }
  };

  const isPending = mode === "otp" ? requestOtp.isPending : loginPassword.isPending;

  return (
    <ScreenContainer scroll className="gap-8 bg-surface-muted">
      <View className="items-center gap-4 pt-16">
        <View
          className="h-20 w-20 items-center justify-center rounded-3xl bg-accent"
          style={shadow.elevated}
        >
          <MilkIcon size={40} color={colors.white} strokeWidth={2} />
        </View>
        <View className="items-center gap-2">
          <Txt variant="h1" accessibilityRole="header">Welcome back</Txt>
          <Txt variant="bodyLg" className="text-center text-ink-muted">
            {mode === "otp"
              ? "Enter your mobile number to receive a one-time code."
              : "Sign in with your password."}
          </Txt>
        </View>
      </View>

      {/* Mode toggle */}
      <View className="flex-row rounded-2xl bg-surface-muted p-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Login with OTP"
          onPress={() => { setMode("otp"); setError(null); }}
          className={cn(
            "flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3",
            mode === "otp" ? "bg-card shadow-sm" : "",
          )}
        >
          <Smartphone size={18} color={mode === "otp" ? colors.accent : colors.textSubtle} strokeWidth={2.2} />
          <Txt variant="label" className={mode === "otp" ? "" : "text-ink-muted"}>OTP Login</Txt>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Login with password"
          onPress={() => { setMode("password"); setError(null); }}
          className={cn(
            "flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3",
            mode === "password" ? "bg-card shadow-sm" : "",
          )}
        >
          <KeyRound size={18} color={mode === "password" ? colors.accent : colors.textSubtle} strokeWidth={2.2} />
          <Txt variant="label" className={mode === "password" ? "" : "text-ink-muted"}>Password</Txt>
        </Pressable>
      </View>

      <Card className="gap-5" variant="elevated">
        <Input
          label="Mobile number"
          prefix="+91"
          keyboardType="number-pad"
          maxLength={10}
          autoFocus
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
          onSubmitEditing={onSubmit}
          error={error ?? undefined}
          placeholder="10-digit number"
        />
        {mode === "password" ? (
          <>
            <Input
              label="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={onSubmit}
              placeholder="Enter your password"
              suffix={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSubtle} strokeWidth={2} />
                  ) : (
                    <Eye size={20} color={colors.textSubtle} strokeWidth={2} />
                  )}
                </Pressable>
              }
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Txt variant="caption" className="text-accent text-right">
                Forgot password?
              </Txt>
            </Pressable>
          </>
        ) : null}
        <Button
          label={mode === "otp" ? "Send OTP" : "Sign in"}
          onPress={onSubmit}
          loading={isPending}
          disabled={phone.length !== 10 || (mode === "password" && !password)}
        />
      </Card>

      <Txt variant="caption" className="text-center">
        By continuing you agree to our Terms & Privacy Policy.
      </Txt>
    </ScreenContainer>
  );
}
