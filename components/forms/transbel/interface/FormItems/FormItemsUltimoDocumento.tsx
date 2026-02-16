import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { Row } from '@tanstack/react-table';
import { UseFormReturn } from 'react-hook-form';

export default function FormItemsUltimoDocumento({
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
          073 - Fecha de Revalidación
        </Label>
        <Input
          id="revalidación"
          disabled
          type="date"
          value={row.original.REVALIDACION_073?.split(' ')[0] ?? ''}
        />
      </div>
      <div>
        <Label htmlFor="MSA" className="mb-1">
          130 - Fecha de MSA
        </Label>
        <Input id="MSA" disabled type="date" value={row.original.MSA_130?.split(' ')[0] ?? ''} />
      </div>
      <div>
        <Label htmlFor="entregaTransporte" className="mb-1">
          138 - Fecha de Entrega a Transporte
        </Label>
        <Input
          id="entregaTransporte"
          disabled
          type="date"
          value={row.original.ENTREGA_TRANSPORTE_138?.split(' ')[0] ?? ''}
        />
      </div>

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>114 - Fecha de Último Documento</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
