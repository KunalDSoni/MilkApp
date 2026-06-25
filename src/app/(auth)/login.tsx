import { useState } from "react";
import { Keyboard, View } from "react-native";
import { useRouter } from "expo-router";
import { MilkIcon } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Txt } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { phoneSchema } from "@/features/auth/schemas";
import { useRequestOtp } from "@/features/auth/hooks";
import { normalizeError } from "@/core/api/errors";

export default function LoginScreen() {
  const router = useRouter();
  const requestOtp = useRequestOtp();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    Keyboard.dismiss();
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    requestOtp.mutate(result.data, {
      onSuccess: () => router.push({ pathname: "/(auth)/otp", params: { phone: result.data } }),
      onError: (err) => setError(normalizeError(err).message),
    });
  };

  return (
    <ScreenContainer scroll className="gap-6 bg-surface">
      <View className="items-center gap-3 pt-12">
        <MilkIcon size={56} color="#1565C0" />
        <Txt variant="h1">Welcome</Txt>
        <Txt variant="muted" className="text-center">
          Enter your mobile number to receive a one-time code.
        </Txt>
      </View>

      <View className="gap-4">
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
        <Button
          label="Send OTP"
          onPress={onSubmit}
          loading={requestOtp.isPending}
          disabled={phone.length !== 10}
        />
      </View>
    </ScreenContainer>
  );
}
