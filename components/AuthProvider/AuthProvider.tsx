'use client';
import { GPClient } from '@/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { VerifySession } from '@/types/auth/verifySession';
import { getRoles } from '@/types/roles/getRoles';
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
  const [userRoleUUID, setUserRoleUUID] = React.useState('');
  const [roles, setRoles] = React.useState<getRoles[]>([]);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    async function verify() {
      const [userReq, rolesReq] = await Promise.all([
        GPClient.post<VerifySession>('/api/auth/verifySession'),
        GPClient.get<getRoles[]>('/api/roles'),
      ]);
      setUser(userReq.data);
      setRoles(rolesReq.data);

      if (rolesReq) {
        const roleObjectFound = rolesReq.data.find((role) => role.id == userReq.data.role);
        setUserRoleUUID(roleObjectFound ? roleObjectFound?.uuid : '');
      }
      setIsAuthLoading(false);
    }
    verify();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthLoading, userRoleUUID, roles }}>
      {children}
    </AuthContext.Provider>
  );
}
