"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Role } from "@prisma/client";
import { apiFetch, refreshSession } from "@/lib/client-api";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  rollNumber: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type SessionContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<SessionUser | null>;
  logout: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async (): Promise<SessionUser | null> => {
    try {
      const data = await apiFetch<{ user: SessionUser | null }>("/api/auth/me");
      if (mounted.current) setUser(data.user);
      return data.user;
    } catch {
      if (mounted.current) setUser(null);
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await load();
    if (mounted.current) setLoading(false);
    return next;
  }, [load]);

  const logout = useCallback(async () => {
    try {
      await apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
    } catch {
      /* clear client state regardless */
    }
    setUser(null);
  }, []);

  useEffect(() => {
    mounted.current = true;
    void (async () => {
      const me = await load();
      // If the access token was missing/expired, rotate the refresh token and retry.
      if (!me) {
        const refreshed = await refreshSession();
        if (refreshed) await load();
      }
      if (mounted.current) setLoading(false);
    })();

    // Keep the 15-minute access token fresh while the tab is open.
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshSession().then((ok) => {
        if (ok) void load();
      });
    }, 10 * 60 * 1000);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshSession().then((ok) => {
          if (ok) void load();
        });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, logout, setUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
