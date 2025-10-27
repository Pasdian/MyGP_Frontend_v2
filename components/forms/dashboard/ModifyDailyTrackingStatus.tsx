import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { Row } from '@tanstack/react-table';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { dashboardModuleEvents } from '@/lib/posthog/events';
import { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { DailyTrackingContext } from '@/contexts/DailyTrackingContext';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import { AxiosError } from 'axios';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

const posthogEvent =
  dashboardModuleEvents.find((e) => e.alias === 'DASHBOARD_MODIFY_OP')?.eventName || '';

export default function ModifyDailyTrackingStatusForm({
  row,
  setOpenDialog,
}: {
  row: Row<DailyTracking>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
  const { setDailyTrackingData } = React.useContext(DailyTrackingContext);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const schema = z.object({
    status: z.string().min(1, 'Ingresa un estatus').max(250, 'Máximo 250 carácteres').toUpperCase(),
    casaUserName: z.string().min(1, 'No puedes cambiar el estatus sin un nombre de usuario CASA'),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      status: row.original.STATUS || '',
      casaUserName: user.complete_user.user.casa_user_name || 'MYGP',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsSubmitting(true);

    try {
      const res = await GPClient.patch(
        `/api/daily-tracking/modify-operation-status/${row.original.NUM_REFE}`,
        {
          status: data.status || '',
          changedBy: data.casaUserName,
        }
      );

      if (res.status === 200) {
        toast.success('Operación modificada correctamente');
        posthog.capture(posthogEvent);

        // Update the modified row in context
        const updated = res.data?.updated ?? {};
        const newStatus = updated.STATUS ?? data.status ?? row.original.STATUS;
        const newModifiedAt =
          updated.MODIFIED_AT ?? row.original.MODIFIED_AT ?? new Date().toISOString();

        setDailyTrackingData((prev) =>
          prev.map((r) =>
            r.NUM_REFE === row.original.NUM_REFE
              ? {
                  ...r,
                  STATUS: newStatus,
                  MODIFIED_AT: newModifiedAt,
                  MODIFIED_AT_FORMATTED: formatISOtoDDMMYYYY(newModifiedAt),
                }
              : r
          )
        );

        setOpenDialog((opened) => !opened);
      } else {
        toast.error('No se pudieron actualizar la operación');
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const msg =
        error.response?.data?.message || error.message || 'Error al modificar la operación';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estatus</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa un estatus..." className="uppercase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="casaUserName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modificado por</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Modificado por..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <MyGPButtonGhost variant="outline" className="cursor-pointer">
              Cancelar
            </MyGPButtonGhost>
          </DialogClose>
          <MyGPButtonSubmit isSubmitting={isSubmitting} />
        </DialogFooter>
      </form>
    </Form>
  );
}
