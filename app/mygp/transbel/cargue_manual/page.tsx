'use client';
import MyGPDatePicker from '@/components/MyGPUI/Datepickers/MyGPDatePicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import axios from 'axios';
import { SendIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';

export function toYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CargueManual() {
  const [isSendingToApi, setIsSendingToApi] = React.useState(false);
  const [taskId, setTaskId] = React.useState('');
  const submitLockRef = React.useRef(false);

  const schema = z.object({
    date: z.date({
      required_error: 'Debes seleccionar una fecha',
      invalid_type_error: 'La fecha no es válida',
    }),
    referenciasTextArea: z
      .string()
      .refine(
        (val) =>
          val
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean).length > 0,
        {
          message: 'Debes ingresar al menos una referencia',
        }
      ),
    suffix: z.string().trim().min(1, 'Debes ingresar un sufijo'),
  });

  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      date: new Date(),
      referenciasTextArea: '',
      suffix: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const lines = data.referenciasTextArea
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    try {
      setIsSendingToApi(true);

      const payload = {
        date: toYMD(data.date), // send "YYYY-MM-DD"
        payload: lines,
        suffix: data.suffix.trim(),
      };

      const res = await GPClient.post<{ task_id: string }>(
        '/pyapi/transbel/uploadCargues',
        payload
      );

      toast.success('Cargue enviado correctamente');
      setTaskId(res.data.task_id);

      form.reset({
        date: data.date,
        referenciasTextArea: '',
        suffix: '',
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
      } else {
        toast.error('Ocurrió un error inesperado');
      }
    } finally {
      setIsSendingToApi(false);
      submitLockRef.current = false;
    }
  };

  const filename = `${toYMD(form.watch('date')).replaceAll('-', '')}${form.watch('suffix') || ''}`;

  return (
    <PermissionGuard requiredPermissions={[PERM.TRANSBEL_CARGUE_MANUAL]}>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">
        Subir Cargue Manual: {filename || '(sin nombre)'}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="mb-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecciona una fecha para el nombre del archivo</FormLabel>
                  <FormControl>
                    <MyGPDatePicker date={field.value} setDate={field.onChange} label="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mb-4">
            <FormField
              control={form.control}
              name="referenciasTextArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingresa las referencias, una por línea</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingresa las referencias"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mb-4">
            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingresa el sufijo del archivo</FormLabel>
                  <FormControl>
                    <Input
                      id="cargue_suffix"
                      placeholder="Ingresa el sufijo del archivo (ej. V1)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <p className="font-bold text-sm mb-2">
            Se enviará el cargue con el siguiente nombre: {filename || '(sin nombre)'}
          </p>
          <p className="font-bold text-sm mb-2">
            Total de Referencias:{' '}
            {form
              .watch('referenciasTextArea')
              .split('\n')
              .map((s: string) => s.trim())
              .filter(Boolean).length || 0}
          </p>

          {taskId && (
            <div className="rounded-md border p-3">
              <p className="font-bold text-sm">Cargue enviado</p>
              <p className="text-sm">Task ID: {taskId}</p>
              <p className="text-sm">El proceso continuará en segundo plano.</p>

              <div className="mt-2 flex gap-2">
                <MyGPButtonPrimary onClick={() => setTaskId('')}>Nuevo cargue</MyGPButtonPrimary>
              </div>
            </div>
          )}
          {!taskId && (
            <MyGPButtonSubmit isSubmitting={isSendingToApi}>
              <SendIcon className="mr-3" />
              Enviar Cargue
            </MyGPButtonSubmit>
          )}
        </form>
      </Form>
    </PermissionGuard>
  );
}
