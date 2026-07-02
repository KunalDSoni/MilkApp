import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { IndianRupee, Banknote, Building2, Camera, Smartphone, Receipt, X } from "lucide-react-native";
import { useCreatePayment } from "@/features/payment/hooks";
import { uploadProofImage } from "@/features/payment/api";
import { PaymentMode } from "@/features/payment/schemas";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { Banner } from "@/components/Banner";
import { colors, shadow } from "@/lib/theme";
import { normalizeError } from "@/core/api/errors";

const modes: { value: PaymentMode; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "UPI", label: "UPI", icon: Smartphone },
  { value: "CHEQUE", label: "Cheque", icon: Building2 },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Receipt },
];

export default function NewPaymentScreen() {
  const router = useRouter();
  const createPayment = useCreatePayment();
  const [mode, setMode] = useState<PaymentMode>("CASH");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [proofImage, setProofImage] = useState<{ uri: string; key: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Camera roll permission is required to attach proof images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploadingImage(true);
    try {
      const uploaded = await uploadProofImage(
        asset.uri,
        asset.fileName ?? `proof_${Date.now()}.jpg`,
        asset.mimeType ?? "image/jpeg",
      );
      setProofImage({ uri: uploaded.url, key: uploaded.key });
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!amount || Number(amount) <= 0) {
        setError("Enter a valid amount");
        return;
      }
      await createPayment.mutateAsync({
        amount,
        paymentDate,
        mode,
        proofImageKey: proofImage?.key,
        note: note.trim() || undefined,
      });
      router.replace("/(app)/payments");
    } catch (e) {
      setError(normalizeError(e).message);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-muted">
      <ScrollView contentContainerClassName="gap-5 p-4">
        <View className="gap-0.5">
          <Txt variant="overline">New Payment</Txt>
          <Txt variant="h2" accessibilityRole="header">Log a Payment</Txt>
        </View>

        {error ? <Banner tone="error" message={error} onDismiss={() => setError(null)} /> : null}

        <Card className="gap-4" variant="elevated" style={shadow.elevated}>
          <Txt variant="label">Payment mode</Txt>
          <View className="flex-row gap-2">
            {modes.map((m) => {
              const active = mode === m.value;
              const Icon = m.icon;
              return (
                <Pressable
                  key={m.value}
                  accessibilityRole="button"
                  accessibilityLabel={m.label}
                  onPress={() => setMode(m.value)}
                  className={`flex-1 items-center gap-2 rounded-2xl py-4 ${active ? "bg-accent" : "bg-surface-muted"}`}
                >
                  <Icon
                    size={22}
                    color={active ? colors.white : colors.textSubtle}
                    strokeWidth={2.2}
                  />
                  <Txt
                    variant="caption"
                    className={active ? "text-white" : "text-ink-muted"}
                  >
                    {m.label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card className="gap-4" variant="elevated" style={shadow.elevated}>
          <Input
            label="Amount (₹)"
            placeholder="0.00"
            keyboardType="decimal"
            value={amount}
            onChangeText={setAmount}
          />
          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={paymentDate}
            onChangeText={setPaymentDate}
          />
          <Input
            label="Note (optional)"
            placeholder="e.g. Payment from Sharma General"
            value={note}
            onChangeText={setNote}
            multiline
          />

          <View className="gap-2">
            <Txt variant="label">Proof of transaction</Txt>
            {proofImage ? (
              <View className="relative">
                <Image
                  source={{ uri: proofImage.uri }}
                  className="h-32 w-full rounded-xl"
                  resizeMode="cover"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove proof image"
                  onPress={() => setProofImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1"
                >
                  <X size={16} color={colors.white} strokeWidth={2.5} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Attach proof image"
                onPress={pickImage}
                disabled={uploadingImage}
                className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6"
              >
                <Camera size={22} color={colors.textSubtle} strokeWidth={2} />
                <Txt variant="body" className="text-ink-muted">
                  {uploadingImage ? "Uploading..." : "Tap to attach photo"}
                </Txt>
              </Pressable>
            )}
          </View>
        </Card>

        <Button
          label={createPayment.isPending ? "Logging..." : "Log Payment"}
          onPress={handleSubmit}
          disabled={createPayment.isPending || uploadingImage}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
