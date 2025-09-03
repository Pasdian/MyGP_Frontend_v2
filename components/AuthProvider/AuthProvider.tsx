'use client';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { LoginResponse } from '@/types/auth/login';
import { jwtDecode } from 'jwt-decode';
import posthog from 'posthog-js';
import { User } from '@/types/user/user';

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

function safeIdentify(person: User) {
  const email = person?.email;
  if (!email) return; // don't identify anonymous/partial users

  posthog.identify(email, {
    uuid: person?.uuid,
  });
}

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
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);

  // Try to refresh using HttpOnly cookie
  const refresh = React.useCallback(async () => {
    // inside refresh()
    try {
      const res = await GPClient.post<LoginResponse>(
        '/api/auth/refreshToken',
        {},
        { withCredentials: true }
      );
      setAccessToken(res.data.accessToken);
      setUser(res.data);
      setIsAuthenticated(true);

      const person = res?.data?.complete_user?.user;
      safeIdentify(person); // identify only after confirmed refresh success
      return true;
    } catch (error) {
      console.error('Error refreshing token', error);
      posthog.reset(); // ensure no stale identity when not authenticated
      return false;
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const ok = await refresh();

      if (cancelled) return;

      const isPublic = pathname === '/' || pathname === '/login';
      const isDashboard = pathname.startsWith('/mygp');

      if (ok) {
        // If logged in and on a public page, go to dashboard
        if (isPublic && !isDashboard) {
          router.replace('/mygp/dashboard');
          return;
        }
        // already authenticated and on a protected page; continue
        setIsLoading(false);
        return;
      }

      // Not authenticated: send to login unless we’re already there
      if (pathname !== '/login') {
        router.replace('/login');
        return;
      }

      setIsLoading(false);
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
    setIsLoginLoading(true);
    return GPClient.post('/api/auth/login', data, { withCredentials: true })
      .then((res: { data: LoginResponse }) => {
        toast.success(res.data.message);
        setAccessToken(res.data.accessToken);
        setUser(res.data);
        setIsAuthenticated(true);

        const person = res.data.complete_user?.user;
        safeIdentify(person); // identify only after successful login

        router.replace('/mygp/dashboard');
        setIsLoginLoading(false);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Login failed');
        setIsLoginLoading(false);
      });
  }

  async function logout() {
    return GPClient.post('/api/auth/logout', {}, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        setAccessToken(null);
        setUser(defaultUser);
        setIsAuthenticated(false);

        posthog.reset(); // drop identity, revert to anonymous
        localStorage.removeItem('dea-external-link-tour');

        window.location.replace('/login');
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Logout failed');
      });
  }

  if (isLoading) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated,
        logout,
        login,
        accessToken,
        refresh,
        isLoginLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
