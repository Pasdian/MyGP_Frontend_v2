import { AuthSession } from '@/types/auth/login';
import { User } from '@/types/permissions/user';
import React from 'react';

export const AuthContext = React.createContext<
  | {
      user: AuthSession;
      setUser: (nextUser: AuthSession) => void;
      isLoading: boolean;
      isAuthenticated: boolean;
      accessToken: string | null;
      logout: () => void;
      setAccessToken: (token: string | null) => void;
      refresh: () => Promise<boolean>;
      setIsAuthenticated: (value: boolean) => void;
      hasPermission: (perm: string | string[]) => boolean;
      hasRole: (role: string | string[]) => boolean;
      safeIdentify(person: User): void;
    }
  | undefined
>(undefined);
