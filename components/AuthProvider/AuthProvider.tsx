'use client';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { VerifySession } from '@/types/auth/verifySession';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { Login } from '@/types/auth/login';

const defaultUser = {
  user: {
    uuid: '',
    name: '',
    casa_user_name: '',
    email: '',
    mobile: '',
    status: '',
    company_name: '',
    company_uuid: '',
    company_casa_id: '',
  },
  role: {
    name: '',
    description: '',
  },
  modules: [],
  iat: 0,
  exp: 0,
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<VerifySession>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function verify() {
      const token = localStorage.getItem('token');
      if (token) {
        const tokenData = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
        const isTokenValid = tokenData.exp * 1000 > Date.now(); // Check expiration
        if (isTokenValid) {
          await GPClient.post('/api/auth/verifySession').then((res: { data: VerifySession }) => {
            setUser(res.data);
            setIsAuthenticated(true);
            setIsLoading(false);
          });
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
      .then(async (res: { data: Login }) => {
        toast.success(res.data.message);
        localStorage.setItem('token', JSON.stringify(res.data.token));
        setUser({
          user: res.data.complete_user.user,
          role: res.data.complete_user.role,
          modules: res.data.complete_user.modules,
          iat: 0,
          exp: 0,
        });
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
        setUser(defaultUser);
        router.push('/login');
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  if (isLoading) return;

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, isAuthenticated, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}
