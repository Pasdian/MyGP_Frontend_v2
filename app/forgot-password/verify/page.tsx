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
import React, { Suspense } from 'react';
import { Eye, EyeOff, Loader2Icon, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import axios from 'axios';

const verifyPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(/[a-z]/, 'Debe contener al menos una letra minúscula.')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula.')
      .regex(/[0-9]/, 'Debe contener al menos un número.')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial.'),
    confirmPassword: z.string(),
    token: z.string({ message: 'No tienes un token' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  });

export default function VerifyPasswordWrapper() {
  return (
    <Suspense>
      <VerifyForgottenPassword />
    </Suspense>
  );
}

function VerifyForgottenPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [shouldViewPassword, setShouldViewPassword] = React.useState(false);
  const [shouldViewConfirmPassword, setShouldViewConfirmPassword] = React.useState(false);
  const [isVerifyingLoading, setIsVerifyingLoading] = React.useState(false);

  const form = useForm<z.infer<typeof verifyPasswordSchema>>({
    resolver: zodResolver(verifyPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
      token: token || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof verifyPasswordSchema>) => {
    try {
      setIsVerifyingLoading(true);

      try {
        const res = await GPClient.post<{ message: string | null }>(
          '/api/auth/forgot-password/verify',
          data,
          {
            withCredentials: true,
          }
        );

        toast.success(res.data.message);

        setIsVerifyingLoading(false);
        form.reset();
      } catch (error: unknown) {
        let message = 'Error del servidor';

        if (axios.isAxiosError(error)) {
          message = (error.response?.data as any)?.message ?? message;
        }

        toast.error(message);
        setIsVerifyingLoading(false);
        throw error;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn('flex flex-col')}>
          <Card className="gap-3">
            <CardHeader>
              <CardTitle>Restablece tu contraseña</CardTitle>
              <CardDescription>Ingresa tus nuevas credenciales para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6 mb-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Nueva contraseña</Label>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={shouldViewPassword ? 'text' : 'password'}
                                  {...field}
                                  placeholder="Nueva contraseña"
                                />
                                {shouldViewPassword ? (
                                  <Eye
                                    className="absolute right-4 top-2"
                                    onClick={() => setShouldViewPassword(!shouldViewPassword)}
                                  />
                                ) : (
                                  <EyeOff
                                    className="absolute right-4 top-2"
                                    onClick={() => setShouldViewPassword(!shouldViewPassword)}
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirma tu contraseña</Label>
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={shouldViewConfirmPassword ? 'text' : 'password'}
                                  {...field}
                                  placeholder="Confirma tu contraseña"
                                />
                                {shouldViewConfirmPassword ? (
                                  <Eye
                                    className="absolute right-4 top-2"
                                    onClick={() =>
                                      setShouldViewConfirmPassword(!shouldViewConfirmPassword)
                                    }
                                  />
                                ) : (
                                  <EyeOff
                                    className="absolute right-4 top-2"
                                    onClick={() =>
                                      setShouldViewConfirmPassword(!shouldViewConfirmPassword)
                                    }
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {isVerifyingLoading ? (
                      <Button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        disabled
                      >
                        Cargando <Loader2Icon className="animate-spin" />
                      </Button>
                    ) : (
                      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                        <RefreshCw />
                        Restablecer mi contraseña
                      </Button>
                    )}
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
