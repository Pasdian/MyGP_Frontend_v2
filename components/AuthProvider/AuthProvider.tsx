'use client';
import { GPClient } from '@/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { VerifySession } from '@/types/auth/verifySession';
import React from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<VerifySession>({
    name: '',
    id: 0,
    uuid: '',
    email: '',
    role: 0,
    casa_user_name: '',
    exp: 0,
    iat: 0,
  });

  React.useEffect(() => {
    async function fetchCredentials() {
      await GPClient.post('/api/auth/verifySession').then((res: { data: VerifySession }) => {
        setUser(res.data);
      });
    }
    fetchCredentials();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
