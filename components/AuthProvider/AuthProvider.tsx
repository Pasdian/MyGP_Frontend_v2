'use client';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { VerifySession } from '@/types/auth/verifySession';
import { getRoles } from '@/types/roles/getRoles';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRoleUUID, setUserRoleUUID] = React.useState('');
  const [roles, setRoles] = React.useState<getRoles[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function verify() {
      const token = localStorage.getItem('token');
      if (token) {
        const tokenData = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
        const isTokenValid = tokenData.exp * 1000 > Date.now(); // Check expiration
        if (isTokenValid) {
          const [userReq, rolesReq] = await Promise.all([
            GPClient.post<VerifySession>('/api/auth/verifySession'),
            GPClient.get<getRoles[]>('/api/roles'),
          ]);

          if (rolesReq) {
            const roleObjectFound = rolesReq.data.find((role) => role.id == userReq.data.role);
            setUserRoleUUID(roleObjectFound ? roleObjectFound?.uuid : '');
          }

          setUser(userReq.data);
          setRoles(rolesReq.data);
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
          setIsLoading(false);
        }
      } else {
        router.push('/login');
        setIsLoading(false);
      }
    }
    verify();
  }, [router, pathname]);

  async function login(data: { email: string; password: string }) {
    return await GPClient.post('/api/auth/login', {
      email: data.email,
      password: data.password,
    })
      .then(async (res) => {
        toast.success(res.data.message);
        localStorage.setItem('token', JSON.stringify(res.data.token));
        router.push('/mygp/dashboard');
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  async function logout() {
    return await GPClient.post('/api/auth/logout')
      .then((res) => {
        toast.success(res.data.message);
        localStorage.removeItem('token');
        setUser({
          name: '',
          id: 0,
          uuid: '',
          email: '',
          role: 0,
          casa_user_name: '',
          iat: 0,
          exp: 0,
        });
        router.push('/login');
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, userRoleUUID, roles, isAuthenticated, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
}
