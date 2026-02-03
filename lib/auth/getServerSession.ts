// lib/auth/getServerSession.ts
import { cookies } from "next/headers";
import { GPClient } from "../axiosUtils/axios-instance";
import type { AuthSession, Me } from "@/types/auth/login";
import axios from "axios";

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();

  const hasAccess = cookieStore.get("access_token");
  const hasRefresh = cookieStore.get("refresh_token");

  if (!hasAccess && !hasRefresh) {
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

    const accessCookie = cookieStore.get("access_token");

    const session: AuthSession = {
      message: "",
      accessToken: accessCookie?.value ?? "",
      complete_user: meRes.data.complete_user,
    };

    return session;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null;
    }

    console.error("getServerSession /me failed", err);
    return null;
  }
}
