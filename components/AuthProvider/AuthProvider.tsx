'use client';

import React from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Me, AuthSession } from '@/types/auth/login';
import posthog from 'posthog-js';
import { User } from '@/types/user/user';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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

  // NEW: refresh that just calls /api/auth/me, no /refreshToken
  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const meRes = await GPClient.get<Me>('/api/auth/me', {
        withCredentials: true,
      });

      const next: AuthSession = {
        ...authState.user,
        ...meRes.data,
      };

      setAuthState((prev) => ({
        ...prev,
        user: next,
        isAuthenticated: true,
        isLoading: false,
      }));

      const person = next.complete_user?.user;
      if (person) safeIdentify(person);

      return true;
    } catch (error) {
      console.error('Error refreshing AuthSession via /api/auth/me', error);

      posthog.reset();

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        accessToken: null,
        user: defaultUser,
        isLoading: false,
      }));

      router.replace('/login');

      return false;
    }
  }, [authState.user, router]);

  React.useEffect(() => {
    if (isAuthenticated && user?.complete_user?.user) {
      safeIdentify(user.complete_user.user);
    }
  }, [isAuthenticated, user]);

  // Periodically revalidate session via /api/auth/me
  React.useEffect(() => {
    if (!isAuthenticated) return;

    // Revalidate every 5 minutes (300000 ms)
    const INTERVAL = 5 * 60 * 1000;

    const id = setInterval(() => {
      refresh(); // This now calls GET /api/auth/me
    }, INTERVAL);

    return () => clearInterval(id);
  }, [isAuthenticated, refresh]);

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
