import { LoginResponse } from '@/types/auth/login';
import React from 'react';

export const AuthContext = React.createContext<
  | {
      isLoginLoading: boolean;
      user: LoginResponse;
      setUser: React.Dispatch<React.SetStateAction<LoginResponse>>;
      isLoading: boolean;
      isAuthenticated: boolean;
      accessToken: string | null;
      logout: () => void;
      login: (data: { email: string; password: string }) => void;
      refresh: () => Promise<boolean>;
    }
  | undefined
>(undefined);
