/**
 * One-tap WhatsApp outreach. Dairy distribution runs on WhatsApp, so order
 * confirmations, statements, and payment reminders go out as prefilled chats.
 */
import { Linking } from "react-native";
import { alertDialog } from "./dialog";

/** Strip everything but digits; wa.me wants a bare international number. */
function toWaNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Open a WhatsApp chat to `phone` with `message` prefilled. Falls back to an
 * alert if WhatsApp / the link can't be opened (e.g. not installed).
 */
export async function openWhatsApp(phone: string, message: string): Promise<void> {
  const number = toWaNumber(phone);
  if (!number) {
    alertDialog("No number", "This outlet has no phone number on file.");
    return;
  }
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
  } catch {
    alertDialog(
      "Couldn't open WhatsApp",
      "Make sure WhatsApp is installed and try again.",
    );
  }
}
