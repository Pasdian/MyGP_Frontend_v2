import { VerifySession } from '@/types/auth/verifySession';
import React from 'react';

export const AuthContext = React.createContext<
  | {
      user: VerifySession;
      setUser: React.Dispatch<React.SetStateAction<VerifySession>>;
      isUserLoading: boolean;
    }
  | undefined
>(undefined);
