import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import { REF_VALIDATION } from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { FolioData } from '@/types/transbel/folioData';
import useSWR from 'swr/immutable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import axios from 'axios';
import { getCargues } from '@/types/transbel/getCargues';
import { CarguesContext } from '@/contexts/CarguesContext';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

// onSubmit (updates only selected field from API response)
type PatchResp = {
  message: string;
  data: {
    NUM_REFE: string;
    CVE_DAT: 1 | 2 | 3;
    ETI_IMPR: 'EE' | 'GE' | 'CECO' | 'CUENTA';
    DAT_EMB: string;
  };
};
const comboOptions = [
  { label: 'Importación', value: 'IMPO' },
  { label: 'Exportación', value: 'EXPO' },
  { label: 'Muestras', value: 'CECO' },
];

export default function CarguesUpdateFolioForm({
  row,
  setOpenDialog,
}: {
  row: Row<getCargues>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setCargues } = React.useContext(CarguesContext);
  const [comboValue, setComboValue] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const folioKey =
    row.original.NUM_REFE && `/api/transbel/datosEmbarque?reference=${row.original.NUM_REFE}`;

  const { data: folioData, isLoading: isFolioDataLoading } = useSWR<FolioData>(
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
    setIsSubmitting(true);

    const CVE_DAT =
      comboValue === 'IMPO' ? 1 : comboValue === 'EXPO' ? 2 : comboValue === 'CECO' ? 3 : -1;

    try {
      const res = await GPClient.patch(`/api/transbel/datosEmbarque/${data.reference}`, {
        CVE_DAT,
        EE_DATEMB: data.EE,
        GE_DATEMB: data.GE,
        CECO_DATEMB: data.CECO,
        CUENTA_DATEMB: data.CUENTA,
      });

      if (res.status === 200) {
        const { data: payload } = res.data as PatchResp;
        // Debug info
        const field = payload.ETI_IMPR as 'EE' | 'GE' | 'CECO' | 'CUENTA';
        const value = String(payload.DAT_EMB ?? '').trim();

        setCargues((prev) =>
          prev.map((r) =>
            r.NUM_REFE === payload.NUM_REFE
              ? ({ ...r, [field]: value, NUM_TRAFICO: value } as getCargues)
              : r
          )
        );

        toast.success('Datos modificados correctamente');
        setOpenDialog((o) => !o);
      } else {
        toast.error('No se pudieron actualizar tus datos');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Error al actualizar');
      } else {
        toast.error('Error desconocido al actualizar');
      }
    } finally {
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
            <MyGPButtonSubmit isSubmitting={isSubmitting} />
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
