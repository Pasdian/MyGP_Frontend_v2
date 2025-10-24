'use client';

import React from 'react';

import { z } from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Row } from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ExceptionCodeCombo from '@/components/comboboxes/ExceptionCodeCombo';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { IconTrashFilled } from '@tabler/icons-react';
import { deliveriesUpsertPhaseSchema } from '@/lib/schemas/transbel/deliveries/deliveriesUpsertPhaseSchema';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { transbelModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import { DeliveriesContext } from '@/contexts/DeliveriesContext';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';

const posthogEvent =
  transbelModuleEvents.find((e) => e.alias === 'TRANSBEL_MODIFY_DELIVERY')?.eventName || '';

export default function DeliveriesUpsertPhaseForm({ row }: { row: Row<getDeliveries> }) {
  const { user } = useAuth();
  const { setDeliveries } = React.useContext(DeliveriesContext);

  const form = useForm<z.infer<typeof deliveriesUpsertPhaseSchema>>({
    resolver: zodResolver(deliveriesUpsertPhaseSchema),
    mode: 'onChange',
    defaultValues: {
      ref: row?.original?.REFERENCIA || '',
      phase: '140',
      exceptionCode: row?.original?.CE_140 || '',
      cdp: row?.original?.ENTREGA_CDP_140 || '',
      user: user.complete_user.user.casa_user_name
        ? user.complete_user.user.casa_user_name
        : 'MYGP',
      transporte: row?.original?.ENTREGA_TRANSPORTE_138?.split(' ')[0],
    },
  });
  console.log(form.formState.errors);

  async function onSubmit(data: z.infer<typeof deliveriesUpsertPhaseSchema>) {
    await GPClient.patch(`/api/casa/upsertPhase/${data.ref}`, {
      phase: data.phase,
      exceptionCode: data.exceptionCode,
      date: data.cdp,
      user: data.user,
    })
      .then((res) => {
        if (res.status === 200) {
          const response = res.data.data;
          const { NUM_REFE, FEC_ETAP } = response;

          // Update deliveries state
          setDeliveries((prev) =>
            prev.map((item) =>
              item.REFERENCIA === NUM_REFE
                ? {
                    REFERENCIA: item.REFERENCIA,
                    EE__GE: item.EE__GE,
                    GUIA_HOUSE: '',
                    ENTREGA_TRANSPORTE_138: item.ENTREGA_TRANSPORTE_138_FORMATTED,
                    CE_138: item.CE_138,
                    ENTREGA_CDP_140: FEC_ETAP,
                    CE_140: item.CE_140,
                    has_guia_house_error: false,
                    has_entrega_cdp_error: false,
                    has_entrega_transporte_error: false,
                    BUSINESS_DAYS_ERROR_MSG: '',
                    MSA_130_ERROR_MSG: '',
                    ENTREGA_TRANSPORTE_138_ERROR_MSG: '',
                    ENTREGA_CDP_140_ERROR_MSG: '',
                    GUIA_HOUSE_ERROR_MSG: '',
                    ENTREGA_TRANSPORTE_138_FORMATTED: '',
                    ENTREGA_CDP_140_FORMATTED: formatISOtoDDMMYYYY(FEC_ETAP),
                  }
                : item
            )
          );

          toast.success('Datos modificados correctamente');
          posthog.capture(posthogEvent);
        } else {
          toast.error('No se pudieron actualizar tus datos');
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Error de conexión');
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="ref"
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

          <FormField
            control={form.control}
            name="transporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega a Transporte</FormLabel>
                <FormControl>
                  <Input disabled type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cdp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega a CDP</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exceptionCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Excepción</FormLabel>
                <FormControl>
                  <div className="flex">
                    <div className="mr-2">
                      <ExceptionCodeCombo
                        onSelect={(value) => {
                          field.onChange(value);
                          form.trigger();
                        }}
                        currentValue={field.value}
                      />
                    </div>
                    <Button
                      className="cursor-pointer bg-red-500 hover:bg-red-600"
                      type="button"
                      onClick={() => {
                        form.setValue('exceptionCode', '');
                        form.trigger();
                      }}
                    >
                      <IconTrashFilled />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Usuario..." className="mb-4 uppercase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
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
  );
}
