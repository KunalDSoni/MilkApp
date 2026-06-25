import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProducts } from "@/features/products/hooks";
import {
  useCreateStandingOrder,
  useDeleteStandingOrder,
  useStandingOrders,
  useUpdateStandingOrder,
} from "@/features/standing/hooks";
import { StandingForm, standingFormSchema } from "@/features/standing/schemas";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { QuantityStepper } from "@/components/QuantityStepper";
import { LoadingState } from "@/components/LoadingState";
import { productUnitLabel } from "@/features/products/schemas";
import { FULL_WEEK_MASK, WEEKDAYS, maskHasDay, toggleMaskDay } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { normalizeError } from "@/core/api/errors";

export default function StandingEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const products = useProducts();
  const standing = useStandingOrders();
  const existing = useMemo(
    () => standing.data?.find((s) => s.id === id),
    [standing.data, id],
  );

  const createMut = useCreateStandingOrder();
  const updateMut = useUpdateStandingOrder(id ?? "");
  const deleteMut = useDeleteStandingOrder();

  const { control, handleSubmit, watch, setValue, formState } = useForm<StandingForm>({
    resolver: zodResolver(standingFormSchema),
    defaultValues: {
      name: existing?.name ?? "",
      weekdayMask: existing?.weekdayMask ?? FULL_WEEK_MASK,
      active: existing?.active ?? true,
      items: existing?.items.map((l) => ({ productId: l.productId, qty: l.qty })) ?? [],
    },
  });

  const weekdayMask = watch("weekdayMask");
  const items = watch("items");

  const setQty = (productId: string, qty: number) => {
    const others = items.filter((l) => l.productId !== productId);
    const next = qty > 0 ? [...others, { productId, qty }] : others;
    setValue("items", next, { shouldValidate: true });
  };

  const qtyOf = (productId: string) =>
    items.find((l) => l.productId === productId)?.qty ?? 0;

  const onSubmit = (values: StandingForm) => {
    const mutation = id ? updateMut : createMut;
    mutation.mutate(values, {
      onSuccess: () => router.back(),
      onError: (err) => Alert.alert("Error", normalizeError(err).message),
    });
  };

  const onDelete = () => {
    if (!id) return;
    Alert.alert("Delete standing order", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMut.mutate(id, {
            onSuccess: () => router.back(),
            onError: (err) => Alert.alert("Error", normalizeError(err).message),
          }),
      },
    ]);
  };

  if (products.isLoading) return <LoadingState />;
  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen
        options={{ headerShown: true, title: id ? "Edit Standing Order" : "New Standing Order" }}
      />
      <ScrollView contentContainerClassName="p-4 gap-4">
        <Card className="gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name (optional)"
                placeholder="e.g. Daily milk"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          <View className="gap-2">
            <Txt variant="label">Repeat on</Txt>
            <View className="flex-row flex-wrap gap-2">
              {WEEKDAYS.map((d) => {
                const selected = maskHasDay(weekdayMask, d.bit);
                return (
                  <Pressable
                    key={d.bit}
                    onPress={() =>
                      setValue("weekdayMask", toggleMaskDay(weekdayMask, d.bit), {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "h-11 min-w-12 items-center justify-center rounded-xl border px-3",
                      selected ? "border-brand bg-brand-light" : "border-surface-muted bg-surface",
                    )}
                  >
                    <Txt variant="label" className={selected ? "text-brand-dark" : "text-ink-muted"}>
                      {d.short}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
            {formState.errors.weekdayMask ? (
              <Txt variant="caption" className="text-danger">
                {formState.errors.weekdayMask.message}
              </Txt>
            ) : null}
          </View>

          <View className="flex-row items-center justify-between">
            <Txt variant="label">Active</Txt>
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Switch value={field.value} onValueChange={field.onChange} />
              )}
            />
          </View>
        </Card>

        <Card className="gap-1">
          <Txt variant="title" className="mb-2">
            Products
          </Txt>
          {products.data?.map((p) => (
            <View
              key={p.id}
              className="flex-row items-center justify-between border-b border-surface-muted py-2"
            >
              <View className="flex-1">
                <Txt variant="label">{p.name}</Txt>
                <Txt variant="caption">{productUnitLabel(p)}</Txt>
              </View>
              <QuantityStepper value={qtyOf(p.id)} onChange={(q) => setQty(p.id, q)} min={0} />
            </View>
          ))}
          {formState.errors.items ? (
            <Txt variant="caption" className="mt-2 text-danger">
              {formState.errors.items.message}
            </Txt>
          ) : null}
        </Card>

        {id ? (
          <Button
            label="Delete"
            variant="danger"
            icon={<Trash2 size={18} color="#fff" />}
            loading={deleteMut.isPending}
            onPress={onDelete}
          />
        ) : null}
      </ScrollView>

      <View className="border-t border-surface-muted bg-surface p-4">
        <Button
          label={id ? "Save changes" : "Create"}
          loading={submitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </SafeAreaView>
  );
}
