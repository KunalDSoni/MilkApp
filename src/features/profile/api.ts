import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { Profile, ProfileForm, profileSchema } from "./schemas";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Mock distributor profile for offline/preview mode.
const mockProfile: Profile = {
  businessName: "Demo Distributor",
  contactName: "Demo Manager",
  address: null,
  phone: "+919000000002",
  region: "North",
};

export async function fetchProfile(): Promise<Profile> {
  if (env.useMocks) {
    await delay(200);
    return profileSchema.parse(mockProfile);
  }
  const { data } = await apiClient.get("/me/profile");
  return profileSchema.parse(data);
}

export async function updateProfile(input: ProfileForm): Promise<Profile> {
  if (env.useMocks) {
    await delay(300);
    Object.assign(mockProfile, input);
    return profileSchema.parse(mockProfile);
  }
  const { data } = await apiClient.patch("/me/profile", input);
  return profileSchema.parse(data);
}
