'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { z } from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Eye, EyeOff, Loader2Icon } from 'lucide-react';
import { loginSchema } from '@/lib/schemas/login/loginSchema';
import { useRouter } from 'next/navigation';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { LoginResponse } from '@/types/auth/login';
import axios from 'axios';

export default function Page() {
  const router = useRouter();
  const [shouldView, setShouldView] = React.useState(false);
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/mygp/dashboard');
  }, [router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoginLoading(true);

      try {
        const loginRes = await GPClient.post<LoginResponse>('/api/auth/login', data, {
          withCredentials: true,
        });

        toast.success(loginRes.data.message);

        // Optional: if your API returns an access token and you still want localStorage
        // if (loginRes.data?.accessToken) localStorage.setItem('token', loginRes.data.accessToken);

        setIsLoginLoading(false);
        return router.replace('/mygp/dashboard');
      } catch (error: unknown) {
        let message = 'Login failed';

        if (axios.isAxiosError(error)) {
          message = (error.response?.data as any)?.message ?? message;
        }

        toast.error(message);
        setIsLoginLoading(false);
        throw error;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader>
              <CardTitle>Iniciar sesión en tu cuenta</CardTitle>
              <CardDescription>
                Ingresa tu correo electrónico para iniciar sesión en tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Contraseña</Label>
                      </div>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={shouldView ? 'text' : 'password'}
                                  {...field}
                                  placeholder="Contraseña"
                                />
                                {shouldView ? (
                                  <Eye
                                    className="absolute right-4 top-2"
                                    onClick={() => setShouldView(!shouldView)}
                                  />
                                ) : (
                                  <EyeOff
                                    className="absolute right-4 top-2"
                                    onClick={() => setShouldView(!shouldView)}
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      {isLoginLoading ? (
                        <Button
                          type="submit"
                          className="w-full bg-blue-500 hover:bg-blue-600"
                          disabled
                        >
                          Cargando <Loader2Icon className="animate-spin" />
                        </Button>
                      ) : (
                        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                          Iniciar sesión
                        </Button>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <p
                        onClick={() => router.push('/forgot-password')}
                        className="cursor-pointer text-sm underline text-blue-500"
                      >
                        ¿Olvidaste tu contraseña?
                      </p>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
