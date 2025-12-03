import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '@/hooks/useAuth';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useNumRefeParams } from '@/app/providers/NumRefeParamsProvider';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';
import { IconPencil } from '@tabler/icons-react';
import { EtapasCombobox } from '@/components/MyGPUI/Combobox/EtapasCombobox';
import MyGPDatePicker from '@/components/MyGPUI/Datepickers/MyGPDatePicker';
import { SaveIcon } from 'lucide-react';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { normalizeSqlDate } from '@/lib/utilityFunctions/normalizeSqlDate';

const modifyEtapaSchema = z.object({
  etapa: z.string({ required_error: 'Selecciona una etapa' }).min(1, 'Selecciona una etapa'),

  observaciones: z.string().max(250, 'Máximo 250 caracteres').optional(),

  fecha: z
    .date({ required_error: 'Ingresa una fecha' })
    .refine((date) => date <= new Date(), { message: 'La fecha no puede ser mayor a hoy' }),

  modificadoPor: z.string({ required_error: 'Usuario requerido' }).min(1, 'Usuario requerido'),
});

type ModifyEtapaFormValues = z.infer<typeof modifyEtapaSchema>;

type ModifyEtapaProps = {
  CVE_ETAP: string;
  FEC_ETAP: string;
};

export function ModifyEtapa({ CVE_ETAP, FEC_ETAP }: ModifyEtapaProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { ADU_DESP, PAT_AGEN, NUM_REFE } = useNumRefeParams();
  const modificadoPor = user?.complete_user?.user?.casa_user_name || 'MYGP';
  const form = useForm<ModifyEtapaFormValues>({
    resolver: zodResolver(modifyEtapaSchema),
    defaultValues: {
      etapa: CVE_ETAP || '',
      observaciones: '',
      fecha: new Date(normalizeSqlDate(FEC_ETAP)),
      modificadoPor,
    },
  });

  const onSubmit = async (data: ModifyEtapaFormValues) => {
    setIsSubmitting(true);

    const payload = {
      phase: data.etapa,
      exceptionCode: '',
      date: data.fecha ? data.fecha.toISOString() : null,
      user: data.modificadoPor,
    };

    try {
      await GPClient.patch(`/api/casa/upsertPhase/${NUM_REFE}`, payload);

      toast.success('Etapa modificada correctamente');
    } catch (error: unknown) {
      console.error(error);
      toast.error('Ocurrió un error al modificar la etapa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MyGPDialog
      trigger={
        <MyGPButtonWarning>
          <IconPencil />
          Modificar
        </MyGPButtonWarning>
      }
    >
      <p className="font-bold text-lg">Modificar - {NUM_REFE}</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Etapa */}
          <FormField
            control={form.control}
            name="etapa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selecciona una etapa</FormLabel>
                <FormControl>
                  <EtapasCombobox
                    ADU_DESP={ADU_DESP || ''}
                    PAT_AGEN={PAT_AGEN || ''}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observaciones */}
          <FormField
            control={form.control}
            name="observaciones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Input placeholder="Observaciones.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha */}
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <MyGPDatePicker date={field.value} setDate={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modificado por */}
          <FormField
            control={form.control}
            name="modificadoPor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modificado por</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Modificado por.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <MyGPButtonSubmit isSubmitting={isSubmitting}>
              <SaveIcon />
              Guardar cambios
            </MyGPButtonSubmit>
          </div>
        </form>
      </Form>
    </MyGPDialog>
  );
}
