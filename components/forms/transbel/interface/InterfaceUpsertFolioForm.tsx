import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import { FOLIO_VALIDATION, REF_VALIDATION } from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { getRefsPendingCEFormat } from '@/types/transbel/getRefsPendingCE';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { MyGPCombo } from '@/components/comboboxes/MyGPCombo';
import { FolioRow } from '@/types/transbel/folioData';

const comboOptions = [
  {
    label: 'Importación',
    value: 'IMPO',
  },
  {
    label: 'Exportación',
    value: 'EXPO',
  },
  {
    label: 'Muestras',
    value: 'CECO',
  },
];

export default function InterfaceUpsertFolioForm({
  row,
  setOpenDialog,
  folioRows,
}: {
  row: Row<getRefsPendingCEFormat>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  folioRows: FolioRow[];
}) {
  const [comboValue, setComboValue] = React.useState('');
  const foundEE = folioRows.find((folio) => folio.ETI_IMPR == 'EE')?.DAT_EMB;
  const foundGE = folioRows.find((folio) => folio.ETI_IMPR == 'GE')?.DAT_EMB;
  const foundCECO = folioRows.find((folio) => folio.ETI_IMPR == 'CECO')?.DAT_EMB;
  const foundCUENTA = folioRows.find((folio) => folio.ETI_IMPR == 'CUENTA')?.DAT_EMB;

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
    defaultValues: {
      reference: row.original.REFERENCIA || '',
      EE: foundEE || '',
      GE: foundGE || '',
      CECO: foundCECO || '',
      CUENTA: foundCUENTA || '',
    },
  });

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
      GE_DATEMB: data.GE,
      CECO_DATEMB: data.CECO,
      CUENTA_DATEMB: data.CUENTA,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos modificados correctamente');
          setOpenDialog((opened) => !opened);
          mutate('/api/transbel/getRefsPendingCE');
        } else {
          toast.error('No se pudieron actualizar tus datos');
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  return (
    <div>
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
            {comboValue == 'EXPO' && (
              <FormField
                control={form.control}
                name="GE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folio Exportación (GE)</FormLabel>
                    <FormControl>
                      <Input placeholder="Folio Exportacón.." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {comboValue == 'CECO' && (
              <>
                <FormField
                  control={form.control}
                  name="CECO"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Folio CECO</FormLabel>
                      <FormControl>
                        <Input placeholder="Folio CECO..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="CUENTA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Folio CUENTA</FormLabel>
                      <FormControl>
                        <Input placeholder="Folio CUENTA..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
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
