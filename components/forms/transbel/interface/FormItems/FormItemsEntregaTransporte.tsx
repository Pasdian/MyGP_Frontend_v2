import ExceptionCodeCombo from '@/components/comboboxes/ExceptionCodeCombo';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shouldPutExceptionCode } from '@/lib/utilityFunctions/shouldPutExceptionCode';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { IconTrashFilled } from '@tabler/icons-react';
import { Row } from '@tanstack/react-table';
import { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

const ExceptionCodeField = ({
  form,
  row,
}: {
  form: UseFormReturn<
    {
      ref: string;
      phase: string;
      date: string;
      exceptionCode?: string | undefined;
      user?: string | undefined;
    },
    unknown,
    {
      ref: string;
      phase: string;
      date: string;
      exceptionCode?: string | undefined;
      user?: string | undefined;
    }
  >;
  row: Row<getRefsPendingCE>;
}) => {
  const EXCEPTION_CODE = useWatch({
    control: form.control,
    name: 'exceptionCode',
  });

  const ENTREGA_TRANSPORTE_138_DATE = useWatch({
    control: form.control,
    name: 'date',
  });

  const showExceptionCode = shouldPutExceptionCode({
    exceptionCode: EXCEPTION_CODE,
    initialDate: row.original.ULTIMO_DOCUMENTO_114,
    finalDate: ENTREGA_TRANSPORTE_138_DATE,
    numDays: 7,
  });

  const shouldShow = showExceptionCode || !!EXCEPTION_CODE;

  if (!shouldShow) return null; // <- fine here (component return), not inside render prop

  return (
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
  );
};

export default function FormItemsEntregaTransporte({
  form,
  row,
}: {
  form: UseFormReturn<
    {
      ref: string;
      phase: string;
      date: string;
      exceptionCode?: string | undefined;
      user?: string | undefined;
    },
    unknown,
    {
      ref: string;
      phase: string;
      date: string;
      exceptionCode?: string | undefined;
      user?: string | undefined;
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
        <Input
          id="revalidación"
          disabled
          type="date"
          value={row.original.REVALIDACION_073?.split(' ')[0] ?? ''}
        />
      </div>
      <div>
        <Label htmlFor="ultimoDoc" className="mb-1">
          Fecha de Último Documento
        </Label>
        <Input
          id="ultimoDoc"
          disabled
          type="date"
          value={row.original.ULTIMO_DOCUMENTO_114?.split(' ')[0] ?? ''}
        />
      </div>
      <div>
        <Label htmlFor="MSA" className="mb-1">
          Fecha de MSA
        </Label>
        <Input id="MSA" disabled type="date" value={row.original.MSA_130?.split(' ')[0] ?? ''} />
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

      <ExceptionCodeField form={form} row={row} />
    </>
  );
}
