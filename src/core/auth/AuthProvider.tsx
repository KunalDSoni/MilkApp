/**
 * Session source-of-truth for the app. Wraps the tree, resolves the stored
 * session on boot, and exposes sign-in / sign-out. Route groups read `status`
 * to gate access.
 */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearTokens, loadTokens, saveTokens, storage } from "./session";
import { setSessionExpiredHandler } from "@/core/api/client";
import { logout as logoutApi } from "@/features/auth/api";
import { User, VerifyResult, userSchema } from "@/features/auth/schemas";

const USER_KEY = "auth.user";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn: (result: VerifyResult) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const signOut = useCallback(async () => {
    await logoutApi();
    await clearTokens();
    await storage.deleteItem(USER_KEY);
    queryClient.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, [queryClient]);

  const signIn = useCallback(async (result: VerifyResult) => {
    await saveTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    await storage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  // Resolve any persisted session on boot.
  useEffect(() => {
    let active = true;
    (async () => {
      const tokens = await loadTokens();
      if (!active) return;
      if (!tokens) {
        setStatus("unauthenticated");
        return;
      }
      const raw = await storage.getItem(USER_KEY);
      const parsed = raw ? userSchema.safeParse(JSON.parse(raw)) : null;
      if (parsed?.success) setUser(parsed.data);
      setStatus("authenticated");
    })();
    return () => {
      active = false;
    };
  }, []);

  // When a token refresh fails irrecoverably, drop the session.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      void signOut();
    });
  }, [signOut]);

  const value = useMemo(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
