'use client';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { LoginResponse } from '@/types/auth/login';
import { jwtDecode } from 'jwt-decode';
import posthog from 'posthog-js';
import { useDEAStore } from '@/app/providers/dea-store-provider';

type JwtClaims = { exp?: number };

const defaultUser: LoginResponse = {
  message: '',
  accessToken: '',
  complete_user: {
    user: {
      uuid: '',
      name: '',
      casa_user_name: '',
      email: '',
      mobile: '',
      status: '',
      company_name: '',
      company_uuid: '',
      company_casa_id: '',
    },
    role: { uuid: '', name: '', description: '', permissions: [] },
    modules: [],
  },
};

// helper: ms until we should refresh (slightly before exp)
function msUntilRefresh(token: string | null | undefined): number {
  try {
    if (!token) return 0;
    const { exp } = jwtDecode<JwtClaims>(token);
    if (!exp) return 0;

    const expMs = exp * 1000;
    const threshold =
      process.env.NODE_ENV === 'production'
        ? 2 * 60_000 // refresh 2 min before expiry
        : 10_000; // refresh 10s before expiry in dev

    const diff = expMs - Date.now() - threshold;

    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { resetDEAState } = useDEAStore((state) => state);
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = React.useState<LoginResponse>(defaultUser);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // refresh with refresh_token (cookie)
  const refresh = React.useCallback(async () => {
    try {
      const res = await GPClient.post('/api/auth/refreshToken');
      setAccessToken(res.data.accessToken);
      setUser(res.data);
      setIsAuthenticated(true);

      const person = res.data.complete_user.user;
      posthog?.identify(person.uuid, { $email: person.email });
      posthog?.group('company', person.company_uuid || '', { name: person.company_name });
      return true;
    } catch (error) {
      console.error('Error refreshing token', error);
      return false;
    }
  }, []);

  // On mount / route change
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (pathname === '/login') {
        setIsLoading(false);
        return;
      }

      const ok = await refresh();
      if (!ok && !cancelled) router.push('/login');
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, refresh, router]);

  // Schedule refresh dynamically (instead of polling)
  React.useEffect(() => {
    if (pathname === '/login' || !accessToken) return;

    const delay = msUntilRefresh(accessToken);

    const id = setTimeout(async () => {
      const ok = await refresh();
      if (!ok) router.push('/login');
    }, delay);

    return () => clearTimeout(id);
  }, [pathname, accessToken, refresh, router]);

  // login
  async function login(data: { email: string; password: string }) {
    return GPClient.post('/api/auth/login', data, { withCredentials: true })
      .then((res: { data: LoginResponse }) => {
        toast.success(res.data.message);
        setAccessToken(res.data.accessToken);
        setUser(res.data);
        setIsAuthenticated(true);
        const person = res.data.complete_user.user;
        posthog?.identify(person.uuid, { $email: person.email });
        posthog?.group('company', person.company_uuid || '', { name: person.company_name });
        router.push('/mygp/dashboard');
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Login failed');
      });
  }

  // logout
  async function logout() {
    return GPClient.post('/api/auth/logout', {}, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        setAccessToken(null);
        setUser(defaultUser);
        setIsAuthenticated(false);
        router.push('/login');
        resetDEAState();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Logout failed');
      });
  }

  if (isLoading) return null;

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, isAuthenticated, logout, login, accessToken, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}
