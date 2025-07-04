import { VerifySession } from '@/types/auth/verifySession';
import { getRoles } from '@/types/roles/getRoles';
import React from 'react';

export const AuthContext = React.createContext<
  | {
      user: VerifySession;
      setUser: React.Dispatch<React.SetStateAction<VerifySession>>;
      isAuthLoading: boolean;
      userRoleUUID: string;
      roles: getRoles[];
    }
  | undefined
>(undefined);
