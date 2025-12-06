'use client';

import React from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LoginResponse, Me, AuthSession } from '@/types/auth/login';
import { jwtDecode } from 'jwt-decode';
import posthog from 'posthog-js';
import { User } from '@/types/user/user';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type JwtClaims = { exp?: number };

const defaultUser: AuthSession = {
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
  if (!email) return;
  posthog.identify(email, { uuid: person.uuid });
}

function msUntilRefresh(token: string | null | undefined): number {
  try {
    if (!token) return 0;
    const { exp } = jwtDecode<JwtClaims>(token);
    if (!exp) return 0;
    const expMs = exp * 1000;
    const threshold = 10_000;
    return Math.max(0, expMs - Date.now() - threshold);
  } catch {
    return 0;
  }
}

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser: AuthSession | null;
  initialAccessToken?: string | null;
};

type AuthState = {
  user: AuthSession;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export default function AuthProvider({
  children,
  initialUser,
  initialAccessToken,
}: AuthProviderProps) {
  const router = useRouter();

  const [authState, setAuthState] = React.useState<AuthState>({
    user: initialUser ?? defaultUser,
    accessToken: initialAccessToken ?? initialUser?.accessToken ?? null,
    isAuthenticated: Boolean(initialUser),
    isLoading: false,
  });

  const { user, accessToken, isAuthenticated, isLoading } = authState;

  const setUser = (nextUser: AuthSession) => {
    setAuthState((prev) => ({ ...prev, user: nextUser }));
  };

  const setAccessToken = (token: string | null) => {
    setAuthState((prev) => ({ ...prev, accessToken: token }));
  };

  const setIsAuthenticated = (value: boolean) => {
    setAuthState((prev) => ({ ...prev, isAuthenticated: value }));
  };

  const setIsLoading = (value: boolean) => {
    setAuthState((prev) => ({ ...prev, isLoading: value }));
  };

  const roleName = user?.complete_user?.role?.name;
  const permissions = React.useMemo(() => user?.complete_user?.role?.permissions ?? [], [user]);

  const getCasaUsername = () => {
    return user.complete_user.user.casa_user_name;
  };

  const hasRole = React.useCallback(
    (role: string | string[]) => {
      if (!roleName) return false;
      if (Array.isArray(role)) {
        return role.includes(roleName);
      }
      return roleName === role;
    },
    [roleName]
  );

  const hasPermission = React.useCallback(
    (perm: string | string[]) => {
      if (!permissions.length) return false;

      if (Array.isArray(perm)) {
        return permissions.some((p) => perm.includes(p.action as string));
      }

      return permissions.some((p) => (p.action as string) === perm);
    },
    [permissions]
  );

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const refreshRes = await GPClient.post<LoginResponse>(
        '/api/auth/refreshToken',
        {},
        { withCredentials: true }
      );

      const newToken = refreshRes.data.accessToken;

      const meRes = await GPClient.get<Me>('/api/auth/me', {
        withCredentials: true,
      });

      const next: AuthSession = {
        ...refreshRes.data,
        ...meRes.data,
      };

      setAuthState((prev) => ({
        ...prev,
        accessToken: newToken,
        user: next,
        isAuthenticated: true,
        isLoading: false,
      }));

      const person = next.complete_user?.user;
      if (person) safeIdentify(person);

      return true;
    } catch (error) {
      console.error('Error refreshing AuthSession', error);

      posthog.reset();

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        accessToken: null,
        user: defaultUser,
        isLoading: false,
      }));

      return false;
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && user?.complete_user?.user) {
      safeIdentify(user.complete_user.user);
    }
  }, [isAuthenticated, user]);

  // Schedule revalidation based on token expiry (same in dev and prod)
  React.useEffect(() => {
    if (!accessToken) return;

    const delay = msUntilRefresh(accessToken);

    if (delay <= 0) {
      refresh();
      return;
    }

    const id = window.setTimeout(() => {
      refresh();
    }, delay);

    return () => window.clearTimeout(id);
  }, [accessToken, refresh]);

  async function logout() {
    try {
      const res = await GPClient.post('/api/auth/logout', {}, { withCredentials: true });

      toast.success(res.data.message);

      posthog.reset();
      localStorage.removeItem('dea-external-link-tour');

      setAuthState((prev) => ({
        ...prev,
        accessToken: null,
        user: defaultUser,
        isAuthenticated: false,
      }));

      router.replace('/login');
    } catch (error: unknown) {
      let message = 'Logout failed';

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? message;
      }

      toast.error(message);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated,
        logout,
        setAccessToken,
        setIsAuthenticated,
        accessToken,
        safeIdentify,
        refresh,
        hasRole,
        hasPermission,
        getCasaUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
