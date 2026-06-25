import { useMutation } from "@tanstack/react-query";
import { normalizeError } from "@/core/api/errors";
import { requestOtp, verifyOtp } from "./api";

export function useRequestOtp() {
  return useMutation({
    mutationFn: (phone: string) => requestOtp(phone),
    // Surface a normalized error to the screen.
    onError: (error) => normalizeError(error),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      verifyOtp(phone, otp),
  });
}
