import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statusOptions } from '@/lib/statusOptions/statusOptions';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

const posthogEvent =
  dashboardModuleEvents.find((e) => e.alias === 'DASHBOARD_MODIFY_OP')?.eventName || '';

export default function ModifyDailyTrackingStatusForm({
  row,
  setOpenDialog,
}: {
  row: Row<DailyTracking>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user, getCasaUsername } = useAuth();
  const { setDailyTrackingData } = React.useContext(DailyTrackingContext);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentStatus = row.original.STATUS || '';

  const findInitialValues = (status: string) => {
    const upperStatus = status.toUpperCase();
    for (const [category, options] of Object.entries(statusOptions)) {
      const match = options.find((opt) => opt.toUpperCase() === upperStatus);
      if (match) return { category, status: match };
    }
    return { category: '', status: '' };
  };

  const { category: initialCategory, status: initialStatus } = React.useMemo(
    () => findInitialValues(currentStatus),
    [currentStatus]
  );

  const schema = z.object({
    category: z.string().optional(),
    status: z.string().min(1, 'Selecciona un estatus'),
    casaUserName: z.string().min(1, 'No puedes cambiar el estatus sin un nombre de usuario CASA'),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      category: initialCategory,
      status: initialStatus,
      casaUserName: user.complete_user.user.casa_user_name || 'MYGP',
    },
  });

  const selectedCategory = form.watch('category');

  const assign182Phase = async (row: Row<DailyTracking>) => {
    const NUM_REFE = row.original.NUM_REFE;
    const today = new Date().toISOString().split('T')[0];

    const payload = {
      phase: '182',
      exceptionCode: '',
      date: today,
      user: getCasaUsername() || 'MYGP',
    };

    await GPClient.patch(`/api/casa/upsertPhase/${NUM_REFE}`, payload);

    toast.info('Fase actualizada correctamente');

    setDailyTrackingData((prev) => prev.filter((item) => item.NUM_REFE !== NUM_REFE));

    setOpenDialog(false);
  };

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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('status', ''); // Reset status when category changes
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(statusOptions).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <MyGPCombo
                  label="Estatus"
                  placeholder="Selecciona un estatus"
                  value={field.value || ''}
                  setValue={field.onChange}
                  options={
                    selectedCategory
                      ? statusOptions[selectedCategory as keyof typeof statusOptions].map(
                          (status) => ({
                            value: status,
                            label: status,
                          })
                        )
                      : []
                  }
                  aria-invalid={!!form.formState.errors.status}
                  className={!selectedCategory ? 'opacity-50 pointer-events-none' : undefined}
                />
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
        <div className="mt-4 w-full flex items-center justify-between">
          <Button
            className="bg-red-500 font-bold hover:bg-red-600 cursor-pointer"
            onClick={() => assign182Phase(row)}
            type="button"
          >
            <Trash />
            Eliminar
          </Button>

          <div className="flex gap-2">
            <DialogClose asChild>
              <MyGPButtonGhost variant="outline">Cancelar</MyGPButtonGhost>
            </DialogClose>

            <MyGPButtonSubmit isSubmitting={isSubmitting} />
          </div>
        </div>
      </form>
    </Form>
  );
}
