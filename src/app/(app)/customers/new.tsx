import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateCustomer } from "@/features/customers/hooks";
import { CustomerForm, customerFormSchema } from "@/features/customers/schemas";
import { alertDialog } from "@/lib/dialog";
import { normalizeError } from "@/core/api/errors";

export default function NewCustomerScreen() {
  const router = useRouter();
  const createMut = useCreateCustomer();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { outletName: "", address: "", route: "", gstin: "", phone: "" },
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
              label="Contact / WhatsApp number"
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
        <Button
          label="Add customer"
          onPress={handleSubmit(onSubmit)}
          loading={createMut.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
