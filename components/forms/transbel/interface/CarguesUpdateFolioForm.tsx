import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import { REF_VALIDATION } from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { MyGPCombo } from '@/components/comboboxes/MyGPCombo';
import { FolioData } from '@/types/transbel/folioData';
import useSWRImmutable from 'swr/immutable';
import { getCarguesFormat } from '@/types/transbel/getCargues';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { IconSettings } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const comboOptions = [
  { label: 'Importación', value: 'IMPO' },
  { label: 'Exportación', value: 'EXPO' },
  { label: 'Muestras', value: 'CECO' },
];

export default function CarguesUpdateFolioForm({
  row,
  setOpenDialog,
}: {
  row: Row<getCarguesFormat>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [comboValue, setComboValue] = React.useState('');
  const carguesKey = '/api/transbel/getCargues';
  const [isSending, setIsSending] = React.useState(false);
  const folioKey =
    row.original.NUM_REFE && `/api/transbel/datosEmbarque?reference=${row.original.NUM_REFE}`;

  const { data: folioData, isLoading: isFolioDataLoading } = useSWRImmutable<FolioData>(
    folioKey,
    axiosFetcher
  );

  const defaults = React.useMemo(() => {
    const getVal = (tag: string) =>
      folioData?.data?.find((folio) => folio.ETI_IMPR === tag)?.DAT_EMB ?? '';

    return {
      reference: row.original.NUM_REFE ?? '',
      EE: getVal('EE'),
      GE: getVal('GE'),
      CECO: getVal('CECO'),
      CUENTA: getVal('CUENTA'),
    };
  }, [folioData, row.original.NUM_REFE]);

  // Minimal change: make fields optional + superRefine based on comboValue
  const schema = React.useMemo(
    () =>
      z.object({
        reference: REF_VALIDATION,
        EE: z.string().optional(),
        GE: z.string().optional(),
        CECO: z.string().optional(),
        CUENTA: z.string().optional(),
      }),
    []
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: defaults,
    shouldUnregister: true, // important for conditional fields
  });

  // keep your refill
  React.useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  // (Optional) auto-pick section when data arrives so fields show with values
  React.useEffect(() => {
    if (!folioData) return;
    if (defaults.EE) setComboValue('IMPO');
    else if (defaults.GE) setComboValue('EXPO');
    else if (defaults.CECO || defaults.CUENTA) setComboValue('CECO');
  }, [folioData, defaults]);

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsSending(true);
    const CVE_DAT =
      comboValue == 'IMPO' ? 1 : comboValue == 'EXPO' ? 2 : comboValue == 'CECO' ? 3 : -1;

    try {
      const res = await GPClient.post('/api/transbel/datosEmbarque', {
        NUM_REFE: data.reference,
        CVE_DAT,
        EE_DATEMB: data.EE,
        GE_DATEMB: data.GE,
        CECO_DATEMB: data.CECO,
        CUENTA_DATEMB: data.CUENTA,
      });

      if (res.status == 200) {
        toast.success('Datos modificados correctamente');
        setOpenDialog((opened) => !opened);
        mutate(carguesKey);
        setIsSending(false);
      } else {
        toast.error('No se pudieron actualizar tus datos');
        setIsSending(false);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? 'Error al actualizar');
      } else {
        toast.error('Error desconocido al actualizar');
      }

      setIsSending(false);
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
          Editar Folio - {row.original.NUM_REFE}
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

            {comboValue == 'EXPO' && (
              <FormField
                control={form.control}
                name="GE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folio Exportación (GE)</FormLabel>
                    <FormControl>
                      <Input placeholder="Folio Exportación.." {...field} />
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
            <Button
              disabled={isSending}
              className="cursor-pointer bg-yellow-500 hover:bg-yellow-600"
              type="submit"
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  <p>Enviando</p>
                </>
              ) : (
                <>
                  <IconSettings className="h-4 w-4" />
                  <p>Guardar Cambios</p>
                </>
              )}{' '}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
