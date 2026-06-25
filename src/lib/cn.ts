import { twMerge } from "tailwind-merge";

/** Merge Tailwind class strings, resolving conflicts (last wins). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
