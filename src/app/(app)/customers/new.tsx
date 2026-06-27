import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { useCreateCustomer, useSalesTeam } from "@/features/customers/hooks";
import { CustomerForm, customerFormSchema } from "@/features/customers/schemas";
import { alertDialog } from "@/lib/dialog";
import { normalizeError } from "@/core/api/errors";
import { cn } from "@/lib/cn";

export default function NewCustomerScreen() {
  const router = useRouter();
  const createMut = useCreateCustomer();
  const salesTeam = useSalesTeam();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      outletName: "",
      address: "",
      route: "",
      gstin: "",
      phone: "",
      whatsapp: "",
      paymentTerms: "",
      outletType: "EXISTING",
      salesOfficerId: "",
    },
  });

  const onSubmit = (values: CustomerForm) => {
    createMut.mutate(values, {
      onSuccess: () => router.back(),
      onError: (err) =>
        alertDialog("Couldn't add customer", normalizeError(err).message),
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "Add Customer" }} />
      <ScrollView
        contentContainerClassName="p-4 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="outletName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Outlet name"
              placeholder="e.g. Sharma General Store"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.outletName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="outletType"
          render={({ field: { onChange, value } }) => (
            <View className="gap-1.5">
              <Txt variant="overline">Outlet type</Txt>
              <View className="flex-row gap-2">
                {(["EXISTING", "NEW"] as const).map((t) => {
                  const active = value === t;
                  return (
                    <Pressable
                      key={t}
                      accessibilityRole="button"
                      onPress={() => onChange(t)}
                      className={cn(
                        "flex-1 items-center rounded-xl border px-3 py-3",
                        active ? "border-accent bg-accent-soft" : "border-border bg-card",
                      )}
                    >
                      <Txt
                        variant="label"
                        className={active ? "text-accent" : "text-ink-muted"}
                      >
                        {t === "NEW" ? "New outlet" : "Existing outlet"}
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
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Address"
              placeholder="Shop address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.address?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="route"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Route name / number"
              placeholder="e.g. Route A"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.route?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="gstin"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="GST number (optional)"
              placeholder="15-character GSTIN"
              autoCapitalize="characters"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.gstin?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Contact number"
              prefix="+91"
              keyboardType="number-pad"
              maxLength={10}
              placeholder="10-digit number"
              value={value}
              onChangeText={(t) => onChange(t.replace(/\D/g, ""))}
              onBlur={onBlur}
              error={errors.phone?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="whatsapp"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="WhatsApp number (optional)"
              prefix="+91"
              keyboardType="number-pad"
              maxLength={10}
              placeholder="If different from contact"
              value={value ?? ""}
              onChangeText={(t) => onChange(t.replace(/\D/g, ""))}
              onBlur={onBlur}
              error={errors.whatsapp?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="paymentTerms"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Payment terms (optional)"
              placeholder="e.g. 7 days credit, Cash on delivery"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.paymentTerms?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="salesOfficerId"
          render={({ field: { onChange, value } }) => (
            <View className="gap-1.5">
              <Txt variant="overline">Sales rep (optional)</Txt>
              <View className="flex-row flex-wrap gap-2">
                {(salesTeam.data ?? []).map((rep) => {
                  const active = value === rep.id;
                  return (
                    <Pressable
                      key={rep.id}
                      accessibilityRole="button"
                      onPress={() => onChange(active ? "" : rep.id)}
                      className={cn(
                        "rounded-full border px-3.5 py-2",
                        active ? "border-accent bg-accent-soft" : "border-border bg-card",
                      )}
                    >
                      <Txt
                        variant="caption"
                        className={active ? "text-accent" : "text-ink-muted"}
                      >
                        {rep.name}
                      </Txt>
                    </Pressable>
                  );
                })}
                {salesTeam.data && salesTeam.data.length === 0 ? (
                  <Txt variant="caption" className="text-ink-muted">
                    No sales reps available
                  </Txt>
                ) : null}
              </View>
            </View>
          )}
        />

        <Button
          label="Add customer"
          onPress={handleSubmit(onSubmit)}
          loading={createMut.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
