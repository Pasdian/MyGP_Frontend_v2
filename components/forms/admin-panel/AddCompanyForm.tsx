import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { companyModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import { CompanySchema } from '@/lib/schemas/admin-panel/companySchema';

const posthogEvent =
  companyModuleEvents.find((e) => e.alias === 'COMPANY_ADD_COMPANY')?.eventName || '';

export default function AddCompanyForm({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<z.infer<typeof CompanySchema>>({
    resolver: zodResolver(CompanySchema),
    mode: 'onChange',
    defaultValues: {
      NOM_IMP: '',
      CVE_IMP: '',
    },
  });

  async function onSubmit(data: z.infer<typeof CompanySchema>) {
    await GPClient.post(`/api/companies/createCompany`, {
      NOM_IMP: data.NOM_IMP,
      CVE_IMP: data.CVE_IMP,
    })
      .then((res) => {
        toast.success(res.data.message);
        posthog.capture(posthogEvent);
        setIsOpen((opened) => !opened);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="NOM_IMP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Compañia</FormLabel>
                <FormControl>
                  <Input className="uppercase" placeholder="Nombre de la Compañia..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="CVE_IMP"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>ID CASA</FormLabel>
                <FormControl>
                  <Input placeholder="ID CASA" {...field} />
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
          <Button className="cursor-pointer bg-blue-500 hover:bg-blue-600" type="submit">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
