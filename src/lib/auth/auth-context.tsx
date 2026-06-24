"use client";

import * as React from "react";
import { apiFetch } from "@/lib/api-client";
import { getDeviceFingerprint } from "@/lib/fingerprint";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  tier: "free" | "starter" | "pro" | "probundle";
  generationCount: number;
  revisionCount: number;
  isBanned: boolean;
  createdAt: string;
}

export interface UsageSummary {
  tier: string;
  generation: { remaining: number; quota: number; unlimited: boolean };
  revision: { remaining: number; quota: number; unlimited: boolean };
  canExport: boolean;
  premiumModel: boolean;
  resetAt: string | null;
  tierExpiresAt: string | null;
}

interface MeResponse {
  user: AuthUser;
  usage: UsageSummary;
}

interface AuthContextType {
  user: AuthUser | null;
  usage: UsageSummary | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [usage, setUsage] = React.useState<UsageSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const data = await apiFetch<MeResponse>("/api/users/me");
      setUser(data.user);
      setUsage(data.usage);
    } catch {
      setUser(null);
      setUsage(null);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<MeResponse>("/api/users/me");
        if (active) {
          setUser(data.user);
          setUsage(data.usage);
        }
      } catch {
        if (active) {
          setUser(null);
          setUsage(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    await refresh();
    return data.user;
  }, [refresh]);

  const register = React.useCallback(
    async (input: { name?: string; email: string; password: string }) => {
      const deviceFingerprint = getDeviceFingerprint();
      const data = await apiFetch<{ user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...input, deviceFingerprint }),
      });
      setUser(data.user);
      await refresh();
      return data.user;
    },
    [refresh]
  );

  const logout = React.useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setUsage(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, usage, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
