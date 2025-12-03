// lib/auth/getServerSession.ts
import { cookies } from "next/headers";
import { GPClient } from "../axiosUtils/axios-instance";
import type { AuthSession, Me } from "@/types/auth/login";
import axios from "axios";

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("access_token");
  const refreshCookie = cookieStore.get("refresh_token");

  // If there are no auth cookies, user is not logged in
  if (!accessCookie && !refreshCookie) {
    return null;
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ");

  try {
    const meRes = await GPClient.get<Me>("/api/auth/me", {
      headers: {
        cookie: cookieHeader,
      },
      withCredentials: true,
    });

    const session: AuthSession = {
      message: "",
      accessToken: accessCookie?.value ?? "",
      complete_user: meRes.data.complete_user,
    };

    return session;
  } catch (err: unknown) {
    // 401 from /me just means "not logged in" → return null quietly
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 401) {
        return null;
      }
    }

    console.error("getServerSession /me failed", err);
    return null;
  }
}
