import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/LoadingState";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks";
import { Profile, ProfileForm, profileFormSchema } from "@/features/profile/schemas";
import { alertDialog } from "@/lib/dialog";
import { normalizeError } from "@/core/api/errors";

export default function EditProfileScreen() {
  const profile = useProfile();

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "Edit Profile" }} />
      {profile.isLoading || !profile.data ? (
        <LoadingState />
      ) : (
        <ProfileEditForm initial={profile.data} />
      )}
    </SafeAreaView>
  );
}

function ProfileEditForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const updateMut = useUpdateProfile();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      businessName: initial.businessName,
      contactName: initial.contactName,
      address: initial.address ?? "",
    },
  });

  const onSubmit = (values: ProfileForm) => {
    updateMut.mutate(values, {
      onSuccess: () => router.back(),
      onError: (err) => alertDialog("Couldn't save", normalizeError(err).message),
    });
  };

  return (
    <ScrollView
      contentContainerClassName="p-4 gap-4"
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="businessName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Business name"
            placeholder="Your firm / distributor name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.businessName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="contactName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Contact person"
            placeholder="Your name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.contactName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Address"
            placeholder="Business address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.address?.message}
          />
        )}
      />
      <Button
        label="Save changes"
        onPress={handleSubmit(onSubmit)}
        loading={updateMut.isPending}
      />
    </ScrollView>
  );
}
