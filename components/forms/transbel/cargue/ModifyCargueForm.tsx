'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import React from 'react';
import { SaveIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCargue } from '@/hooks/useCargue/useCargue';

const embarqueSchema = z
  .object({
    NUM_REFE: z.string().min(1, 'El número de referencia es requerido'),
    EE: z.string().optional(),
    GE: z.string().optional(),
    CECO: z.string().optional(),
    CUENTA: z.string().optional(),
    ETI_IMPR: z.string().optional(),
    CVE_DAT: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const EE = data.EE?.trim() ?? '';
    const GE = data.GE?.trim() ?? '';
    const CECO = data.CECO?.trim() ?? '';
    const CUENTA = data.CUENTA?.trim() ?? '';

    const hasEE = EE !== '';
    const hasGE = GE !== '';
    const hasCECO = CECO !== '';
    const hasCUENTA = CUENTA !== '';

    // EE only
    if (hasEE) {
      if (hasGE || hasCECO || hasCUENTA) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Si capturas EE, no puedes capturar GE, CECO ni CUENTA.',
          path: ['EE'],
        });
      }
      return;
    }

    // GE only
    if (hasGE) {
      if (hasCECO || hasCUENTA) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Si capturas GE, no puedes capturar CECO ni CUENTA.',
          path: ['GE'],
        });
      }
      return;
    }

    // CECO y CUENTA juntos (y obligatorios si eliges esa opción)
    if (hasCECO || hasCUENTA) {
      if (!(hasCECO && hasCUENTA)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CECO y CUENTA deben capturarse juntos.',
          path: !hasCECO ? ['CECO'] : ['CUENTA'],
        });
      }
      return;
    }

    // Nothing filled
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debes capturar EE, GE o CECO y CUENTA.',
      path: ['EE'],
    });
  });

type EmbarqueFormValues = z.infer<typeof embarqueSchema>;

type ModifyEmbarqueProps = {
  NUM_REFE: string;
  EE: string;
  GE: string;
  CECO: string;
  CUENTA: string;
};

export function ModifyCargueForm({ NUM_REFE, EE, GE, CECO, CUENTA }: ModifyEmbarqueProps) {
  const { updateFolio } = useCargue();

  const form = useForm<EmbarqueFormValues>({
    resolver: zodResolver(embarqueSchema),
    defaultValues: {
      NUM_REFE: NUM_REFE,
      EE: EE ?? '',
      GE: GE ?? '',
      CECO: CECO ?? '',
      CUENTA: CUENTA ?? '',
    },
    mode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const globalError = form.formState.errors.EE?.message;

  const onSubmit = async (data: EmbarqueFormValues) => {
    setIsSubmitting(true);
    try {
      await updateFolio({
        NUM_REFE: data.NUM_REFE,
        EE: data.EE ?? '',
        GE: data.GE ?? '',
        CECO: data.CECO ?? '',
        CUENTA: data.CUENTA ?? '',
      });

      toast.success('Datos actualizados correctamente');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="NUM_REFE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              {!globalError && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="EE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EE</FormLabel>
              <FormControl>
                <Input {...field} placeholder="1234567..." />
              </FormControl>
              {!globalError && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="GE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GE</FormLabel>
              <FormControl>
                <Input {...field} placeholder="1234567..." />
              </FormControl>
              {!globalError && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="CECO"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CECO</FormLabel>
              <FormControl>
                <Input {...field} placeholder="1234567..." />
              </FormControl>
              {!globalError && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="CUENTA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CUENTA</FormLabel>
              <FormControl>
                <Input {...field} placeholder="1234567..." />
              </FormControl>
              {!globalError && <FormMessage />}
            </FormItem>
          )}
        />

        {globalError && <p className="text-sm text-red-500">{globalError}</p>}

        <MyGPButtonSubmit isSubmitting={isSubmitting}>
          <SaveIcon /> Guardar cambios
        </MyGPButtonSubmit>
      </form>
    </Form>
  );
}
