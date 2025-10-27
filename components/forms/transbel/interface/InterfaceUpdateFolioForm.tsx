import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import { FOLIO_VALIDATION, REF_VALIDATION } from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { Row } from '@tanstack/react-table';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { FolioData } from '@/types/transbel/folioData';
import useSWR from 'swr/immutable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import { AxiosError } from 'axios';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

const comboOptions = [
  {
    label: 'Importación',
    value: 'IMPO',
  },
];

export default function UpdateFolioForm({
  row,
  setOpenDialog,
}: {
  row: Row<getRefsPendingCE>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setRefsPendingCE } = React.useContext(InterfaceContext);
  const [comboValue, setComboValue] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const folioKey =
    row.original.REFERENCIA && `/api/transbel/datosEmbarque?reference=${row.original.REFERENCIA}`;

  const { data: folioData, isLoading: isFolioDataLoading } = useSWR<FolioData>(
    folioKey,
    axiosFetcher
  );
  const defaults = React.useMemo(() => {
    const getVal = (tag: string) =>
      folioData?.data?.find((folio) => folio.ETI_IMPR === tag)?.DAT_EMB ?? '';

    return {
      reference: row.original.REFERENCIA ?? '',
      EE: getVal('EE'),
    };
  }, [folioData, row.original.REFERENCIA]);

  const schema = z.object({
    reference: REF_VALIDATION,
    EE: FOLIO_VALIDATION,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: defaults,
  });

  // Refill the form when folioData (or reference) changes
  React.useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsSubmitting(true);
    try {
      const res = await GPClient.patch(`/api/transbel/datosEmbarque/${data.reference}`, {
        CVE_DAT: 1, // Impo
        EE_DATEMB: data.EE,
      });

      if (res.status === 200) {
        const row = res.data.data; // { NUM_REFE, CVE_DAT, ETI_IMPR, DAT_EMB }

        setRefsPendingCE((prev) =>
          prev.map((r) =>
            r.REFERENCIA === row.NUM_REFE
              ? {
                  ...r,
                  EE__GE: row.DAT_EMB, // update only this property
                }
              : r
          )
        );

        toast.success('Datos modificados correctamente');
        setOpenDialog((opened) => !opened);
        setIsSubmitting(false);
      } else {
        toast.error('No se pudieron actualizar tus datos');
        setIsSubmitting(false);
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message = err.response?.data?.message || 'Ocurrió un error';

      toast.error(message);
      setIsSubmitting(false);
    }
  }

  if (isFolioDataLoading)
    return (
      <div className="flex justify-center items-center">
        <TailwindSpinner />
      </div>
    );
  return (
    <div>
      <div className="mb-4">
        <p className="text-lg leading-none font-semibold mb-2">
          Editar Folio - {row.original.REFERENCIA}
        </p>
        <p className="text-muted-foreground text-sm">
          Aquí podrás realizar la modificación del folio de una referencia. Haz click en guardar
          cuando termines de editar los campos.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="Referencia..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <MyGPCombo
              value={comboValue}
              setValue={setComboValue}
              options={comboOptions}
              label="Tipo de Operación"
              pickFirst
            />
            {comboValue == 'IMPO' && (
              <FormField
                control={form.control}
                name="EE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folio Importación (EE)</FormLabel>
                    <FormControl>
                      <Input placeholder="Folio Importación..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <MyGPButtonGhost>Cancelar</MyGPButtonGhost>
            </DialogClose>
            <MyGPButtonSubmit isSubmitting={isSubmitting} />
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
