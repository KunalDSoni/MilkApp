import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { useOutletLedger, useRecordCollection } from "@/features/ledger/hooks";
import {
  PaymentMode,
  RecordCollectionForm,
  paymentModeSchema,
  recordCollectionFormSchema,
} from "@/features/ledger/schemas";
import { alertDialog } from "@/lib/dialog";
import { normalizeError } from "@/core/api/errors";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const MODES = paymentModeSchema.options;
const MODE_LABEL: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

export default function CollectPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ledger = useOutletLedger(id);
  const recordMut = useRecordCollection(id);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordCollectionForm>({
    resolver: zodResolver(recordCollectionFormSchema),
    defaultValues: { amount: "", mode: "CASH", note: "" },
  });

  const onSubmit = (values: RecordCollectionForm) => {
    recordMut.mutate(
      {
        retailerId: id,
        amount: Number(values.amount),
        mode: values.mode,
        note: values.note ? values.note : undefined,
      },
      {
        onSuccess: () => router.back(),
        onError: (err) =>
          alertDialog("Couldn't record payment", normalizeError(err).message),
      },
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "Record Payment" }} />
      <ScrollView contentContainerClassName="p-4 gap-4" keyboardShouldPersistTaps="handled">
        {ledger.data ? (
          <Card variant="flat" className="flex-row items-center justify-between">
            <Txt variant="muted">{ledger.data.outletName}</Txt>
            <Txt variant="num">Due {formatCurrency(ledger.data.balance)}</Txt>
          </Card>
        ) : null}

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Amount received"
              prefix="₹"
              keyboardType="number-pad"
              placeholder="0"
              value={value}
              onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ""))}
              onBlur={onBlur}
              error={errors.amount?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="mode"
          render={({ field: { onChange, value } }) => (
            <View className="gap-1.5">
              <Txt variant="overline">Payment mode</Txt>
              <View className="flex-row flex-wrap gap-2">
                {MODES.map((m) => {
                  const active = value === m;
                  return (
                    <Pressable
                      key={m}
                      accessibilityRole="button"
                      onPress={() => onChange(m)}
                      className={cn(
                        "rounded-full border px-4 py-2.5",
                        active ? "border-accent bg-accent-soft" : "border-border bg-card",
                      )}
                    >
                      <Txt variant="label" className={active ? "text-accent" : "text-ink-muted"}>
                        {MODE_LABEL[m]}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Note (optional)"
              placeholder="e.g. Reference no., remarks"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.note?.message}
            />
          )}
        />

        <Button
          label="Record payment"
          onPress={handleSubmit(onSubmit)}
          loading={recordMut.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
