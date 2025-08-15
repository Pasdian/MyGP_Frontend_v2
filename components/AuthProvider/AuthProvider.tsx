'use client';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { AuthContext } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { LoginResponse } from '@/types/auth/login';
import posthog from 'posthog-js';

const defaultUser = {
  message: '',
  token: '',
  complete_user: {
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
      uuid: '',
      name: '',
      description: '',
      permissions: [],
    },
    modules: [],
  },
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<LoginResponse>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function verify() {
      const token = localStorage.getItem('token');
      posthog?.identify(user.complete_user.user.uuid, {
        email: user.complete_user.user.email,
      });
      posthog?.group(
        user.complete_user.user.company_name || '',
        user.complete_user.user.company_uuid || ''
      );
      if (token) {
        const tokenData = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
        const isTokenValid = tokenData.exp * 1000 > Date.now(); // Check expiration
        if (isTokenValid) {
          await GPClient.post('/api/auth/verifySession').then((res: { data: LoginResponse }) => {
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
      .then(async (res: { data: LoginResponse }) => {
        toast.success(res.data.message);
        localStorage.setItem('token', JSON.stringify(res.data.token));
        setUser(res.data);
        posthog?.identify(res.data.complete_user.user.uuid, {
          email: res.data.complete_user.user.email,
        });
        posthog?.group(
          res.data.complete_user.user.company_name || '',
          res.data.complete_user.user.company_uuid || ''
        );
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
