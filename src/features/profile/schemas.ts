import { z } from "zod";

/** GET /me/profile response. */
export const profileSchema = z.object({
  businessName: z.string(),
  contactName: z.string(),
  address: z.string().nullable(),
  phone: z.string(),
  region: z.string().nullable(),
});
export type Profile = z.infer<typeof profileSchema>;

/** Editable fields (RHF form). */
export const profileFormSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(120),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  address: z.string().trim().max(240),
});
export type ProfileForm = z.infer<typeof profileFormSchema>;
