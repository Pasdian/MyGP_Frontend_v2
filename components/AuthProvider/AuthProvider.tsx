'use client';
import { GPClient } from '@/axios-instance';
import React from 'react';

type AxiosResponseData = {
  id: number;
  uuid: string;
  casa_user_name: string | null;
  name: string;
  email: string;
  role: number;
  iat: number;
  exp: number;
};

type Credentials = {
  casa_user_name: string | null;
  name: string;
  email: string;
  role: number;
};

export const AuthContext = React.createContext<Credentials>({
  casa_user_name: '',
  name: '',
  email: '',
  role: 0,
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<Credentials>({
    casa_user_name: '',
    name: '',
    email: '',
    role: 0,
  });

  React.useEffect(() => {
    async function fetchCredentials() {
      await GPClient.post('/api/auth/verifySession').then((res: { data: AxiosResponseData }) => {
        setUser(res.data);
      });
    }
    fetchCredentials();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
