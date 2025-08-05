import { ExceptionCodeCombo } from '@/components/comboboxes/ExceptionCodeCombo';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { IconTrashFilled } from '@tabler/icons-react';
import { Row } from '@tanstack/react-table';
import { UseFormReturn } from 'react-hook-form';

export default function FormItemsEntregaTransporte({
  form,
  row,
}: {
  form: UseFormReturn<
    {
      ref: string;
      phase: string;
      exceptionCode: string | undefined;
      date: string;
      time: string;
      user: string | undefined;
    },
    unknown,
    {
      ref: string;
      phase: string;
      exceptionCode: string | undefined;
      date: string;
      time: string;
      user: string | undefined;
    }
  >;
  row: Row<getRefsPendingCE>;
}) {
  return (
    <>
      <div>
        <Label htmlFor="revalidación" className="mb-1">
          Fecha de Revalidación
        </Label>
        <Input id="revalidación" disabled type="date" value={row.original.REVALIDACION_073 ?? ''} />
      </div>
      <div>
        <Label htmlFor="ultimoDoc" className="mb-1">
          Fecha de Último Documento
        </Label>
        <Input
          id="ultimoDoc"
          disabled
          type="date"
          value={row.original.ULTIMO_DOCUMENTO_114 ?? ''}
        />
      </div>
      <div>
        <Label htmlFor="MSA" className="mb-1">
          Fecha de MSA
        </Label>
        <Input id="MSA" disabled type="date" value={row.original.MSA_130 ?? ''} />
      </div>
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de Entrega Transporte</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="exceptionCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código de Excepción</FormLabel>
            <FormControl>
              <div className="flex">
                <div className="mr-2">
                  <ExceptionCodeCombo
                    onSelect={(value) => {
                      field.onChange(value);
                      form.trigger();
                    }}
                    currentValue={field.value}
                  />
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer bg-red-400 hover:bg-red-500"
                  type="button"
                  onClick={() => {
                    form.setValue('exceptionCode', '');
                    form.trigger();
                  }}
                >
                  <IconTrashFilled />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
