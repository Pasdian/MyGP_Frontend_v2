import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import { FOLIO_VALIDATION, REF_VALIDATION } from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { getRefsPendingCEFormat } from '@/types/transbel/getRefsPendingCE';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { MyGPCombo } from '@/components/comboboxes/MyGPCombo';
import { FolioData } from '@/types/transbel/folioData';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import useSWRImmutable from 'swr/immutable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';

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
  row: Row<getRefsPendingCEFormat>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [comboValue, setComboValue] = React.useState('');
  const folioKey =
    row.original.REFERENCIA && `/api/transbel/datosEmbarque?reference=${row.original.REFERENCIA}`;

  const { data: folioData, isLoading: isFolioDataLoading } = useSWRImmutable<FolioData>(
    folioKey,
    axiosFetcher
  );
  const { initialDate, finalDate } = React.useContext(InterfaceContext);

  const defaults = React.useMemo(() => {
    const getVal = (tag: string) =>
      folioData?.data?.find((folio) => folio.ETI_IMPR === tag)?.DAT_EMB ?? '';

    return {
      reference: row.original.REFERENCIA ?? '',
      EE: getVal('EE'),
      GE: getVal('GE'),
      CECO: getVal('CECO'),
      CUENTA: getVal('CUENTA'),
    };
  }, [folioData, row.original.REFERENCIA]);

  const schema = z.object({
    reference: REF_VALIDATION,
    EE: FOLIO_VALIDATION,
    GE: FOLIO_VALIDATION,
    CECO: FOLIO_VALIDATION,
    CUENTA: FOLIO_VALIDATION,
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
    await GPClient.post('/api/transbel/datosEmbarque', {
      NUM_REFE: data.reference,
      CVE_DAT:
        comboValue == 'IMPO'
          ? 1
          : comboValue == 'EXPO'
          ? 2
          : comboValue == 'CECO'
          ? 3
          : comboValue == 'CUENTA'
          ? 4
          : -1,
      EE_DATEMB: data.EE,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos modificados correctamente');
          setOpenDialog((opened) => !opened);
          if (!initialDate || !finalDate) return mutate('/api/transbel/getRefsPendingCE');

          mutate(
            `/api/transbel/getRefsPendingCE?initialDate=${
              initialDate.toISOString().split('T')[0]
            }&finalDate=${finalDate.toISOString().split('T')[0]}`
          );
        } else {
          toast.error('No se pudieron actualizar tus datos');
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
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
              <Button variant="outline" className="cursor-pointer">
                Cancelar
              </Button>
            </DialogClose>
            <Button className="cursor-pointer bg-yellow-500 hover:bg-yellow-600" type="submit">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
