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
    iat: 0,
    exp: 0,
  });

  const [isUserLoading, setIsUserLoading] = React.useState(true);

  React.useEffect(() => {
    async function verify() {
      await GPClient.post('/api/auth/verifySession').then((res) => {
        setUser(res.data);
        setIsUserLoading(false);
      });
    }
    verify();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isUserLoading }}>{children}</AuthContext.Provider>
  );
}
