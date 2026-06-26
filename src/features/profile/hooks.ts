import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfile } from "./api";
import { ProfileForm } from "./schemas";

export const profileKeys = {
  me: ["profile", "me"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: fetchProfile,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileForm) => updateProfile(input),
    onSuccess: (data) => qc.setQueryData(profileKeys.me, data),
  });
}
