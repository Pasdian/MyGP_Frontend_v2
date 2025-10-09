import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { DailyTrackingRowFormatted } from '@/types/dashboard/tracking/dailyTracking';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { dashboardModuleEvents } from '@/lib/posthog/events';
import { mutate } from 'swr';
import { Loader2 } from 'lucide-react';

const posthogEvent =
  dashboardModuleEvents.find((e) => e.alias === 'DASHBOARD_MODIFY_OP')?.eventName || '';

export default function ModifyDailyTrackingStatus({
  row,
  setOpenDialog,
}: {
  row: Row<DailyTrackingRowFormatted>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const modifyOperationKey = `/api/daily-tracking/modify-operation-status`;
  const historyKey = `/api/daily-tracking/operation-history?reference=${row.original.NUM_REFE}`;

  const schema = z.object({
    status: z.string().min(1, 'Ingresa un estatus').toUpperCase(),
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
    await GPClient.post(modifyOperationKey, {
      reference: row.original.NUM_REFE || '',
      status: data.status || '',
      changedBy: data.casaUserName,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Operación modificada correctamente');
          posthog.capture(posthogEvent);
          setOpenDialog((opened) => !opened);
          mutate(historyKey);
          setIsSubmitting(false);
        } else {
          toast.error('No se pudieron actualizar la operación');
          setIsSubmitting(false);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        setIsSubmitting(false);
      });
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
            <Button variant="outline" className="cursor-pointer">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            className="cursor-pointer bg-yellow-500 hover:bg-yellow-600"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                <p>Enviando</p>
              </>
            ) : (
              <>
                <p>Guardar Cambios</p>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
