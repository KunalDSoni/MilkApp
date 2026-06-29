import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { LoadingState } from "@/components/LoadingState";
import { useSalesTeam, useCustomers } from "@/features/customers/hooks";
import { useProducts } from "@/features/products/hooks";
import { productUnitLabel } from "@/features/products/schemas";
import { useCreateSalesVisit } from "@/features/sales-visits/hooks";
import { SalesVisitForm, salesVisitFormSchema } from "@/features/sales-visits/schemas";
import { alertDialog } from "@/lib/dialog";
import { normalizeError } from "@/core/api/errors";
import { cn } from "@/lib/cn";

const today = () => new Date().toISOString().slice(0, 10);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Txt variant="overline">{label}</Txt>
      {children}
    </View>
  );
}

function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "rounded-full border px-3.5 py-2",
        active ? "border-accent bg-accent-soft" : "border-border bg-card",
      )}
    >
      <Txt variant="caption" className={active ? "text-accent" : "text-ink-muted"}>
        {label}
      </Txt>
    </Pressable>
  );
}

export default function NewSalesVisitScreen() {
  const router = useRouter();
  // Prefilled when arriving from Today's Beat ("Book visit").
  const { retailerId, route } = useLocalSearchParams<{
    retailerId?: string;
    route?: string;
  }>();
  const salesTeam = useSalesTeam();
  const customers = useCustomers();
  const products = useProducts();
  const createMut = useCreateSalesVisit();

  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const setQty = (id: string, v: string) =>
    setQuantities((q) => ({ ...q, [id]: v.replace(/[^\d.]/g, "") }));

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SalesVisitForm>({
    resolver: zodResolver(salesVisitFormSchema),
    defaultValues: {
      date: today(),
      salesOfficerId: "",
      retailerId: retailerId ?? "",
      routeName: route ?? "",
      outletType: "EXISTING",
      dayStartAt: "",
      inTime: "",
      bookingTime: "",
      competition: "",
      remarks: "",
    },
  });

  const onSubmit = (values: SalesVisitForm) => {
    createMut.mutate(
      { form: values, quantities },
      {
        onSuccess: (res) => {
          alertDialog(
            "Visit saved",
            res.orderTotal
              ? `Order booked for ₹${res.orderTotal}.`
              : "Visit recorded.",
          );
          router.back();
        },
        onError: (err) =>
          alertDialog("Couldn't save visit", normalizeError(err).message),
      },
    );
  };

  if (salesTeam.isLoading || customers.isLoading || products.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
        <Stack.Screen options={{ headerShown: true, title: "New Sales Visit" }} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "New Sales Visit" }} />
      <ScrollView contentContainerClassName="p-4 gap-4" keyboardShouldPersistTaps="handled">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.date?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="dayStartAt"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Day start"
                  placeholder="HH:MM"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.dayStartAt?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="salesOfficerId"
          render={({ field: { onChange, value } }) => (
            <Field label="Sales team member">
              <View className="flex-row flex-wrap gap-2">
                {(salesTeam.data ?? []).map((rep) => (
                  <Chip
                    key={rep.id}
                    active={value === rep.id}
                    label={rep.name}
                    onPress={() => onChange(rep.id)}
                  />
                ))}
              </View>
              {errors.salesOfficerId ? (
                <Txt variant="caption" className="text-danger">
                  {errors.salesOfficerId.message}
                </Txt>
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="retailerId"
          render={({ field: { onChange, value } }) => (
            <Field label="Outlet">
              <View className="flex-row flex-wrap gap-2">
                {(customers.data ?? []).map((c) => (
                  <Chip
                    key={c.id}
                    active={value === c.id}
                    label={c.outletName}
                    onPress={() => {
                      onChange(c.id);
                      if (c.route) setValue("routeName", c.route);
                    }}
                  />
                ))}
              </View>
              {errors.retailerId ? (
                <Txt variant="caption" className="text-danger">
                  {errors.retailerId.message}
                </Txt>
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="routeName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Route name / number"
              placeholder="e.g. Route A"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.routeName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="outletType"
          render={({ field: { onChange, value } }) => (
            <Field label="Outlet type">
              <View className="flex-row gap-2">
                {(["EXISTING", "NEW"] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => onChange(t)}
                    className={cn(
                      "flex-1 items-center rounded-xl border px-3 py-3",
                      value === t ? "border-accent bg-accent-soft" : "border-border bg-card",
                    )}
                  >
                    <Txt
                      variant="label"
                      className={value === t ? "text-accent" : "text-ink-muted"}
                    >
                      {t === "NEW" ? "New outlet" : "Existing outlet"}
                    </Txt>
                  </Pressable>
                ))}
              </View>
            </Field>
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="inTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Outlet in-time"
                  placeholder="HH:MM"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.inTime?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="bookingTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Order booking time"
                  placeholder="HH:MM"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.bookingTime?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="competition"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Competition activity"
              placeholder="e.g. Amul 5% off on 500ml"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.competition?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="remarks"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Remarks"
              placeholder="Anything else worth noting"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.remarks?.message}
            />
          )}
        />

        <Field label="Order (SKU quantities)">
          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            {(products.data ?? []).map((p, i) => (
              <View
                key={p.id}
                className={cn(
                  "flex-row items-center gap-3 px-3.5 py-2.5",
                  i > 0 ? "border-t border-border" : "",
                )}
              >
                <View className="flex-1">
                  <Txt variant="label">{p.name}</Txt>
                  <Txt variant="caption" className="text-ink-muted">
                    {productUnitLabel(p)}
                  </Txt>
                </View>
                <Input
                  keyboardType="number-pad"
                  placeholder="0"
                  value={quantities[p.id] ?? ""}
                  onChangeText={(v) => setQty(p.id, v)}
                  className="w-20 text-center"
                />
              </View>
            ))}
          </View>
        </Field>

        <Button
          label="Save visit"
          onPress={handleSubmit(onSubmit)}
          loading={createMut.isPending}
        />
        <View className="h-2" />
      </ScrollView>
    </SafeAreaView>
  );
}
