import { VerifySession } from '@/types/auth/verifySession';
import React from 'react';

export const AuthContext = React.createContext<
  | {
      user: VerifySession;
      setUser: React.Dispatch<React.SetStateAction<VerifySession>>;
      isLoading: boolean;
      isAuthenticated: boolean;
      logout: () => void;
      login: (data: { email: string; password: string }) => void;
    }
  | undefined
>(undefined);
