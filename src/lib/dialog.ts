/**
 * Cross-platform dialogs. react-native-web does not implement `Alert.alert`
 * (it's a silent no-op), so on web we fall back to the browser's confirm/alert.
 * Use these instead of `Alert.alert` for anything that must work on web too.
 */
import { Alert, Platform } from "react-native";

/** Confirm dialog. Invokes `onConfirm` only when the user accepts. */
export function confirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "OK",
): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}

/** Informational alert (single OK). */
export function alertDialog(title: string, message: string): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
