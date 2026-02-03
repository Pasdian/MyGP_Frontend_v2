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
import { IconPlus } from '@tabler/icons-react';
import { EtapasMyGPCombo } from '@/components/MyGPUI/Combobox/EtapasMyGPCombo';
import MyGPDatePicker from '@/components/MyGPUI/Datepickers/MyGPDatePicker';
import { SaveIcon } from 'lucide-react';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { toast } from 'sonner';
import { useEtapas } from '@/hooks/useEtapas/useEtapas';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';

const addEtapaSchema = z.object({
  etapa: z.string({ required_error: 'Selecciona una etapa' }).min(1, 'Selecciona una etapa'),

  observaciones: z.string().max(250, 'Máximo 250 caracteres').optional(),

  fecha: z
    .date({ required_error: 'Ingresa una fecha' })
    .refine((date) => date <= new Date(), { message: 'La fecha no puede ser mayor a hoy' }),

  modificadoPor: z.string({ required_error: 'Usuario requerido' }).min(1, 'Usuario requerido'),
});

type ModifyEtapaFormValues = z.infer<typeof addEtapaSchema>;

export function AñadirEtapa() {
  const { user } = useAuth();
  const { upsertEtapa } = useEtapas();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { ADU_DESP, PAT_AGEN, NUM_REFE } = useNumRefeParams();
  const modificadoPor = user?.complete_user?.user?.casa_user_name || 'MYGP';
  const form = useForm<ModifyEtapaFormValues>({
    resolver: zodResolver(addEtapaSchema),
    defaultValues: {
      etapa: '',
      observaciones: '',
      fecha: new Date(),
      modificadoPor,
    },
  });

  const onSubmit = async (data: ModifyEtapaFormValues) => {
    setIsSubmitting(true);
    upsertEtapa({
      phase: data.etapa,
      date: data.fecha,
      exceptionCode: data.observaciones,
      user: modificadoPor,
    });

    try {
      toast.success('Etapa añadida correctamente');
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
        <MyGPButtonPrimary>
          <IconPlus />
          Añadir Etapa
        </MyGPButtonPrimary>
      }
    >
      <p className="font-bold text-lg">Añadir - {NUM_REFE}</p>

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
                  <EtapasMyGPCombo
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
