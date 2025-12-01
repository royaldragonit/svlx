"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  rank: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
          credentials: "include", // QUAN TRỌNG: phải có
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
    return () => controller.abort();
  }, []);

  return { user, loading, setUser };
}
