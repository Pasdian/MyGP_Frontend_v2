'use client';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { LoginResponse } from '@/types/auth/login';
import { jwtDecode } from 'jwt-decode';
import posthog from 'posthog-js';

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
      companies: [],
    },
    role: { uuid: '', name: '', description: '', permissions: [] },
    modules: [],
  },
};

function msUntilRefresh(token: string | null | undefined): number {
  try {
    if (!token) return 0;
    const { exp } = jwtDecode<JwtClaims>(token);
    if (!exp) return 0;
    const expMs = exp * 1000;
    const threshold = process.env.NODE_ENV === 'production' ? 2 * 60_000 : 10_000;
    return Math.max(0, expMs - Date.now() - threshold);
  } catch {
    return 0;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = React.useState<LoginResponse>(defaultUser);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Try to refresh using HttpOnly cookie
  const refresh = React.useCallback(async () => {
    try {
      // withCredentials is already true in GPClient, but keeping it explicit is fine:
      const res = await GPClient.post('/api/auth/refreshToken', {}, { withCredentials: true });
      setAccessToken(res.data.accessToken);
      setUser(res.data);
      setIsAuthenticated(true);

      const person = res.data.complete_user.user;
      posthog.identify(person.email, {
        uuid: person.uuid,
        company_id: person.company_uuid,
      });
      posthog.group('company', person.company_uuid || '', {
        name: person.company_name,
      });
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
      // If user visits /login, still attempt refresh (HttpOnly cookie)
      if (pathname === '/login') {
        const ok = await refresh();
        if (!cancelled && ok) {
          router.replace('/mygp/dashboard'); // avoid back nav to /login
          return;
        }
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Any other route needs a valid session
      const ok = await refresh();
      if (!cancelled && !ok) {
        router.replace('/login');
      }
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, refresh, router]);

  // Schedule refresh before token expiry
  React.useEffect(() => {
    if (pathname === '/login' || !accessToken) return;
    const delay = msUntilRefresh(accessToken);
    const id = setTimeout(async () => {
      const ok = await refresh();
      if (!ok) router.replace('/login');
    }, delay);
    return () => clearTimeout(id);
  }, [pathname, accessToken, refresh, router]);

  async function login(data: { email: string; password: string }) {
    return GPClient.post('/api/auth/login', data, { withCredentials: true })
      .then((res: { data: LoginResponse }) => {
        toast.success(res.data.message);
        setAccessToken(res.data.accessToken);
        setUser(res.data);
        setIsAuthenticated(true);
        const person = res.data.complete_user.user;
        posthog.identify(person.email ?? '', {
          uuid: person.uuid,
        });
        router.replace('/mygp/dashboard');
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Login failed');
      });
  }

  async function logout() {
    return GPClient.post('/api/auth/logout', {}, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        setAccessToken(null);
        setUser(defaultUser);
        setIsAuthenticated(false);
        router.replace('/login');
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
