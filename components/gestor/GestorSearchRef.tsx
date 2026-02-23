'use client';

import React from 'react';
import { z } from 'zod/v4';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SearchIcon } from 'lucide-react';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import type { GestorRefInfo } from '@/types/gestor/GestorRefInfo';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { GestorRefInfoDataTable } from '../datatables/gestor/GestorRefInfoDataTable';
import { gestorRefInfoColumns } from '@/lib/columns/gestorRefInfoColumns';
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';

export function GestorSearchRef({
  searchRefData,
  setSearchData,
}: {
  searchRefData: GestorRefInfo[];
  setSearchData: React.Dispatch<React.SetStateAction<GestorRefInfo[]>>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = z.object({
    ref: z
      .string()
      .max(12, 'Máximo 12 carácteres')
      .transform((v) => v.toUpperCase()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ref: '' },
  });

  async function onSubmit(dataForm: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      const { data } = await GPClient.get<GestorRefInfo[]>(`/gestor/refInfo?ref=${dataForm.ref}`);

      setSearchData(data);
      toast.success('Referencia correcta');

      setIsSubmitting(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Error al buscar la referencia'
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>Buscar Referencia</CardTitle>
        <CardDescription>
          Aquí podrás buscar los datos de una referencia para subirla al gestor.
        </CardDescription>
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

        <div className="mb-4">
          {searchRefData.length > 0 && (
            <GestorRefInfoDataTable columns={gestorRefInfoColumns} data={searchRefData} />
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <MyGPButtonSubmit form="gastos-form" isSubmitting={isSubmitting}>
            <SearchIcon />
            Buscar referencia
          </MyGPButtonSubmit>
        </Field>
      </CardFooter>
    </Card>
  );
}
