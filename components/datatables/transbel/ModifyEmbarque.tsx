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

const embarqueSchema = z
  .object({
    EE: z.string().optional(),
    GE: z.string().optional(),
    CECO_CUENTA: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const values = [data.EE?.trim(), data.GE?.trim(), data.CECO_CUENTA?.trim()];

    const filledCount = values.filter((v) => v && v !== '').length;

    if (filledCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes capturar exactamente uno de los tres campos.',
        path: ['EE'],
      });
    }

    if (filledCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Solo puedes capturar uno de los tres campos.',
        path: ['EE'],
      });
    }
  });

type EmbarqueFormValues = z.infer<typeof embarqueSchema>;

type ModifyEmbarqueProps = {
  EE: string;
  GE: string;
  CECO_CUENTA: string;
};

export function ModifyEmbarque({ EE, GE, CECO_CUENTA }: ModifyEmbarqueProps) {
  const form = useForm<EmbarqueFormValues>({
    resolver: zodResolver(embarqueSchema),
    defaultValues: {
      EE: EE ?? '',
      GE: GE ?? '',
      CECO_CUENTA: CECO_CUENTA ?? '',
    },
    mode: 'onChange',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const globalError = form.formState.errors.EE?.message;

  const onSubmit = (data: EmbarqueFormValues) => {
    setIsSubmitting(true);
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="EE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EE</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {/* Only show field error if there is no global message */}
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
                <Input {...field} />
              </FormControl>
              {!globalError && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="CECO_CUENTA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CECO/CUENTA</FormLabel>
              <FormControl>
                <Input {...field} />
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
