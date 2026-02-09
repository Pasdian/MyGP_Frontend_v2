'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { SearchIcon } from 'lucide-react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { Gasto } from '@/types/operaciones/gastos/Gasto';
import React from 'react';
import { GastosDataTable } from '@/components/datatables/operaciones/gastos/GastosDataTable';
import { operacionesGastosColumns } from '@/lib/columns/operacionesGastosColumns';

const formSchema = z.object({
  ref: z
    .string()
    .max(12)
    .transform((v) => v.toUpperCase()),
});

export default function Gastos() {
  const [data, setData] = React.useState<Gasto[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ref: '',
    },
  });

  async function onSubmit(dataForm: z.infer<typeof formSchema>) {
    try {
      const { data } = await GPClient.get<Gasto[]>(`/operaciones/gastosByRef?ref=${dataForm.ref}`);

      setData(data);
      toast.success('Si la referencia es correcta, se mostrará la tabla de gastos');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Error al consultar gastos'
      );
    }
  }

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gastos por Referencia</CardTitle>
          <CardDescription>Aquí podrás buscar los gastos por referencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="gastos-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="ref"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gastos-form-title">Referencia</FieldLabel>
                    <Input
                      {...field}
                      id="gastos-form-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="PAI123456..."
                      autoComplete="off"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <MyGPButtonSubmit form="gastos-form">
              <SearchIcon />
              Buscar referencia
            </MyGPButtonSubmit>
          </Field>
        </CardFooter>
      </Card>
      {data.length > 0 && <GastosDataTable columns={operacionesGastosColumns} data={data} />}
    </div>
  );
}
