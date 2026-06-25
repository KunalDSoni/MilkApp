import axios from "axios";

export interface ApiError {
  /** Machine code if the backend provides one (e.g. "WINDOW_CLOSED"). */
  code: string;
  /** Human-readable message safe to show the user. */
  message: string;
  /** HTTP status, or 0 for network/unknown failures. */
  status: number;
  /** Field-level validation errors keyed by field name. */
  fieldErrors?: Record<string, string>;
  /** True when the failure is connectivity-related (no response received). */
  isNetwork: boolean;
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_MESSAGE = "No internet connection. Check your network and retry.";

/** Normalizes any thrown value into a predictable ApiError shape. */
export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        code: "NETWORK",
        message: NETWORK_MESSAGE,
        status: 0,
        isNetwork: true,
      };
    }

    const { status, data } = error.response;
    const body = (data ?? {}) as Record<string, unknown>;
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? String(body.message[0])
          : status >= 500
            ? GENERIC_MESSAGE
            : (body.error as string) ?? GENERIC_MESSAGE;

    return {
      code: typeof body.code === "string" ? body.code : `HTTP_${status}`,
      message,
      status,
      fieldErrors: body.fieldErrors as Record<string, string> | undefined,
      isNetwork: false,
    };
  }

  return {
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : GENERIC_MESSAGE,
    status: 0,
    isNetwork: false,
  };
}
