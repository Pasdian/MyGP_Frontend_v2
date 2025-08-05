import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { Row } from '@tanstack/react-table';
import { UseFormReturn } from 'react-hook-form';

export default function FormItemsRevalidacion({
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
      <div>
        <Label htmlFor="entregaTransporte" className="mb-1">
          Fecha de Entrega a Transporte
        </Label>
        <Input
          id="entregaTransporte"
          disabled
          type="date"
          value={row.original.ENTREGA_TRANSPORTE_138 ?? ''}
        />
      </div>

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de Revalidación</FormLabel>
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
