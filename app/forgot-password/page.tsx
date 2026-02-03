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
import React from 'react';
import { Loader2Icon, SendIcon } from 'lucide-react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import axios from 'axios';

const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Correo electrónico inválido' }),
});

export default function ForgotPassword() {
  const [isSending, setIsSending] = React.useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsSending(true);

      try {
        const res = await GPClient.post<{ message: string | null }>(
          '/api/auth/forgot-password',
          data,
          {
            withCredentials: true,
          }
        );

        toast.success(
          res.data.message || 'Si el correo existe, te enviaremos el correo de confirmación'
        );

        setIsSending(false);
        form.reset();
      } catch (error: unknown) {
        let message = 'Error del servidor';

        if (axios.isAxiosError(error)) {
          message = (error.response?.data as any)?.message ?? message;
        }

        toast.error(message);
        setIsSending(false);
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
              <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription>
                Ingresa tu correo electrónico para recuperar tu contraseña.
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

                    <div className="flex flex-col gap-3">
                      {isSending ? (
                        <Button
                          type="submit"
                          className="w-full bg-blue-500 hover:bg-blue-600"
                          disabled
                        >
                          Cargando <Loader2Icon className="animate-spin" />
                        </Button>
                      ) : (
                        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                          <SendIcon />
                          Enviar Correo Recuperación
                        </Button>
                      )}
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
