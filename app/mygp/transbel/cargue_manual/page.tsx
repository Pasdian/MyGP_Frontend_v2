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
import { toYMD } from '@/lib/utilityFunctions/toYMD';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import useSWR from 'swr'
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance'
import { Progress } from "@/components/ui/progress"

export default function CargueManual() {
  const [isSendingToApi, setIsSendingToApi] = React.useState(false);
  const [taskId, setTaskId] = React.useState('');
  const { data: taskData } = useSWR(taskId ? `/tasks/${taskId}`: null, axiosFetcher, {
    refreshInterval: 1000
  })
  const taskState = taskData?.state;
  const taskInfoMessage = taskData?.info.message;
  const showProgress = taskId && ["PENDING", "STARTED", "PROGRESS", "RETRY"].includes(taskState);

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
        date: data.date,
        payload: lines,
        suffix: data.suffix,
      };
      const res = await GPClient.post<{task_id: string}>('/transbel/uploadCargues', payload);

      toast.success("Iniciando cargue...");
      setTaskId(res.data.task_id)
      setIsSendingToApi(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
        setIsSendingToApi(false);
      } else {
        toast.error('Ocurrió un error inesperado');
        setIsSendingToApi(false);
      }
      setIsSendingToApi(false);
    }
  };

  const filename = `${form.watch('date').toLocaleDateString('en-CA', { timezone: 'America/Mexico_City' }).split('T')[0].replaceAll("-", "") || ''}${form.watch('suffix')}`;

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

          {showProgress ? (
            <div>
              <p>Estado: {taskData?.info?.message}</p>
              <Progress value={taskData?.info?.current ?? 0} className="w-[60%]" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <MyGPButtonSubmit isSubmitting={isSendingToApi}>
                <SendIcon className="mr-3" />
                Enviar Cargue
              </MyGPButtonSubmit>

              {taskState === "MOUNT_MISSING" && (
                <p className="text-red-600 text-sm">
                  Estado: {taskInfoMessage ?? "Error al subir el cargue"}
                </p>
              )}
            </div>
          )}
        </form>
      </Form>
    </PermissionGuard>
  );
}
