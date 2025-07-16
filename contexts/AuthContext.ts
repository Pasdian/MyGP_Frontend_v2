import { VerifySession } from '@/types/auth/verifySession';
import { getRoles } from '@/types/roles/getRoles';
import React from 'react';

export const AuthContext = React.createContext<
  | {
      user: VerifySession;
      setUser: React.Dispatch<React.SetStateAction<VerifySession>>;
      isLoading: boolean;
      userRoleUUID: string;
      roles: getRoles[];
      isAuthenticated: boolean;
      logout: () => void;
      login: (data: { email: string; password: string }) => void;
    }
  | undefined
>(undefined);
