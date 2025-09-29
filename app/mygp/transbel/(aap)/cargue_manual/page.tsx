'use client';
import InitialDatePicker from '@/components/datepickers/InitialDatePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import axios from 'axios';
import { Loader2Icon } from 'lucide-react';
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

function getPreviousBusinessDay(date = new Date()): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 1); // start with yesterday

  // If Saturday → go back to Friday
  if (d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  // If Sunday → go back to Friday
  else if (d.getDay() === 0) {
    d.setDate(d.getDate() - 2);
  }

  return d;
}

function formatLocalYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export default function CargueManual() {
  const [isSendingToApi, setIsSendingToApi] = React.useState(false);

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
      date: getPreviousBusinessDay(),
      referenciasTextArea: '',
      suffix: '',
    },
  });

  const dateVal = form.watch('date');
  const filename = `${dateVal ? formatLocalYYYYMMDD(dateVal) : ''}${form.watch('suffix')}`;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const lines = data.referenciasTextArea
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    try {
      setIsSendingToApi(true);
      const payload = {
        date: data.date.toISOString().split('T')[0],
        payload: lines,
        suffix: data.suffix,
      };
      console.log(payload);
      const res = await GPClient.post('/transbel/uploadCargues', payload);

      toast.success(res.data.message || 'Enviado correctamente a la API');
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

  return (
    <div>
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
                    <InitialDatePicker
                      date={field.value}
                      setDate={field.onChange}
                      onSelect={field.onChange}
                      label=""
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
          {isSendingToApi ? (
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled>
              Cargando <Loader2Icon className="animate-spin" />
            </Button>
          ) : (
            <Button
              className="bg-blue-500 hover:bg-blue-600 cursor-pointer font-bold"
              type="submit"
            >
              Enviar Cargue
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
