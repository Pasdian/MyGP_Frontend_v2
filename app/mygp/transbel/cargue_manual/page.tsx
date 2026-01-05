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
import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { Progress } from '@/components/ui/progress';

export function toYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CargueManual() {
  const [isSendingToApi, setIsSendingToApi] = React.useState(false);
  const [taskId, setTaskId] = React.useState('');

  const RUNNING_STATES = ['PENDING', 'STARTED', 'PROGRESS', 'RETRY'] as const;
  const TERMINAL_STATES = [
    'SUCCESS',
    'FAILURE',
    'REVOKED',
    'MOUNT_MISSING',
    'CARGUE_NOT_FOUND',
  ] as const;
  const ERROR_STATES = ['MOUNT_MISSING', 'CARGUE_NOT_FOUND'] as const;

  const { data: taskData } = useSWR(
    taskId ? `/tasks/${taskId}` : null,
    axiosFetcher,
    {
      refreshInterval: (latestData) => {
        if (!taskId) return 0;
        const state = latestData?.state ?? '';
        const done = TERMINAL_STATES.includes(state as any);
        return done ? 0 : 1000;
      },
      revalidateOnFocus: false,
    }
  );

  const taskState = taskData?.state || '';
  const showProgress = !!taskId && RUNNING_STATES.includes(taskState as any);

  const isErrorState = ERROR_STATES.includes(taskState as any);
  const errorMessage =
    taskData?.info?.message || 'Ocurrió un error al procesar el cargue';

  const schema = z.object({
    date: z.date({
      required_error: 'Debes seleccionar una fecha',
      invalid_type_error: 'La fecha no es válida',
    }),
    referenciasTextArea: z
      .string()
      .min(1, 'Debes ingresar al menos una referencia')
      .refine((val) => !val.endsWith('\n'), {
        message: 'El último elemento no debe terminar con salto de línea (\\n)',
      }),
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
    form.reset();

    const lines = data.referenciasTextArea
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    try {
      setIsSendingToApi(true);

      const payload = {
        date: toYMD(data.date), // send "YYYY-MM-DD"
        payload: lines,
        suffix: data.suffix,
      };

      const res = await GPClient.post<{ task_id: string }>(
        '/transbel/uploadCargues',
        payload
      );

      toast.success('Iniciando cargue...');
      setTaskId(res.data.task_id);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
      } else {
        toast.error('Ocurrió un error inesperado');
      }
    } finally {
      setIsSendingToApi(false);
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
                      onChange={(e) => field.onChange(e.target.value.trim())}
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



          {showProgress && (
            <div>
              <p>Estado: {taskData?.info?.message}</p>
              <Progress value={taskData?.info?.current ?? 0} className="w-[60%]" />
            </div>
          )}

          {isErrorState && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
              <p className="font-semibold">Error</p>
              <p className="text-sm">Estado: {taskState}</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {!showProgress && !isErrorState && (
            <div className="flex flex-col gap-2">
              <div>
                <MyGPButtonSubmit isSubmitting={isSendingToApi}>
                  <SendIcon className="mr-3" />
                  Enviar Cargue
                </MyGPButtonSubmit>
              </div>
            </div>
          )}
        </form>
      </Form>
    </PermissionGuard>
  );
}
