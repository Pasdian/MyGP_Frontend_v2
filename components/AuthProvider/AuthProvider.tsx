'use client';
import { GPClient } from '@/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { APIVerifySession } from '@/types/auth/apiVerifySession';
import React from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<APIVerifySession>({
    user: {
      name: '',
      email: '',
      role: 0,
      casa_user_name: '',
    },
  });

  React.useEffect(() => {
    async function fetchCredentials() {
      await GPClient.post('/api/auth/verifySession').then((res: { data: APIVerifySession }) => {
        setUser(res.data);
      });
    }
    fetchCredentials();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
