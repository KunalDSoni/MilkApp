import { useMutation } from "@tanstack/react-query";
import { normalizeError } from "@/core/api/errors";
import { requestOtp, verifyOtp, loginWithPassword } from "./api";

export function useRequestOtp() {
  return useMutation({
    mutationFn: (phone: string) => requestOtp(phone),
    onError: (error) => normalizeError(error),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      verifyOtp(phone, otp),
  });
}

export function useLoginWithPassword() {
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      loginWithPassword(phone, password),
  });
}
