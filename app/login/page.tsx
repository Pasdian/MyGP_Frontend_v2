'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

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
import { IconMail } from '@tabler/icons-react';

export default function Page() {
  const router = useRouter();
  const [shouldView, setShouldView] = React.useState(false);
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

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

  const supportEmails = [
    'sistemas03@pascal.com.mx',
    'javier@pascal.com.mx',
    'miguel.gonzalez@pascal.com.mx',
  ];

  return (
    <div className="relative min-h-svh w-full">
      {/* Centered login card */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="w-full max-w-sm">
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
                      <Label htmlFor="password">Contraseña</Label>
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
                                    className="absolute right-4 top-2 cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={() => setShouldView(!shouldView)}
                                  />
                                ) : (
                                  <EyeOff
                                    className="absolute right-4 top-2 cursor-pointer text-muted-foreground hover:text-foreground"
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

                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={isLoginLoading}
                    >
                      {isLoginLoading ? (
                        <>
                          Cargando <Loader2Icon className="animate-spin" />
                        </>
                      ) : (
                        'Iniciar sesión'
                      )}
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                      <p
                        onClick={() => router.push('/forgot-password')}
                        className="cursor-pointer text-center text-sm text-blue-500 underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </p>

                      {/* Fake link -> opens Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="cursor-pointer text-center text-sm text-blue-500 underline"
                          >
                            ¿Necesitas ayuda?
                          </button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Soporte</DialogTitle>
                            <DialogDescription>
                              Contacto para ayuda con la aplicación
                            </DialogDescription>
                          </DialogHeader>

                          {/* YOUR SUPPORT BLOCK */}
                          <div className="space-y-2 rounded-md border bg-muted/40 p-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <IconMail className="h-4 w-4" />
                              <span>Contacto de soporte</span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              Si tienes algún problema con la aplicación, puedes escribir a
                              cualquiera de los siguientes correos.
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <a
                                href="mailto:sistemas03@pascal.com.mx"
                                className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs font-mono transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                sistemas03@pascal.com.mx
                              </a>

                              <a
                                href="mailto:javier@pascal.com.mx"
                                className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs font-mono transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                javier@pascal.com.mx
                              </a>

                              <a
                                href="mailto:miguel.gonzalez@pascal.com.mx"
                                className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs font-mono transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                miguel.gonzalez@pascal.com.mx
                              </a>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
