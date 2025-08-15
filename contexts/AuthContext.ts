import { LoginResponse } from '@/types/auth/login';
import React from 'react';

export const AuthContext = React.createContext<
  | {
      user: LoginResponse;
      setUser: React.Dispatch<React.SetStateAction<LoginResponse>>;
      isLoading: boolean;
      isAuthenticated: boolean;
      logout: () => void;
      login: (data: { email: string; password: string }) => void;
    }
  | undefined
>(undefined);
