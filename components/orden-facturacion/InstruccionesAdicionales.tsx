'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';
import { SaveAllIcon } from 'lucide-react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import React from 'react';

const servicioSchema = z.object({
  id: z.string(),
  concepto: z.string(),
  aplica: z.boolean(),
  importe: z
    .number({ invalid_type_error: 'Requerido' })
    .min(0, 'Mínimo 0')
    .refine((v) => !isNaN(v), 'Inválido'),
  cantidad: z.number().min(0, 'Mínimo 0').optional(),
});

const instruccionesSchema = z.object({
  servicios: z.array(servicioSchema),
});

export type InstruccionesFormValues = z.infer<typeof instruccionesSchema>;

const defaultServicios: InstruccionesFormValues['servicios'] = [
  { id: '1', concepto: 'Captura Fact. COVE', aplica: false, importe: 0 },
  { id: '2', concepto: 'Servicio Extraordinario AA', aplica: false, importe: 0 },
  {
    id: '3',
    concepto: 'Colocación de Candados Fiscales en Transporte',
    aplica: false,
    importe: 0,
    cantidad: 0,
  },
  { id: '4', concepto: 'Firma Digital', aplica: false, importe: 0 },
];

function toApiPayload(num_refe: string, servicios: InstruccionesFormValues['servicios']) {
  const [cove, aa, candados, firma] = servicios;

  return {
    num_refe,
    captura_factura_cove: cove.aplica ? 1 : 0,
    captura_factura_cove_monto: cove.aplica ? cove.importe : null,
    extraordinario_aa: aa.aplica ? 1 : 0,
    extraordinario_aa_monto: aa.aplica ? aa.importe : null,
    candados_fiscales: candados.aplica ? 1 : 0,
    candados_fisc_monto: candados.aplica ? candados.importe : null,
    candados_fisc_cant: candados.aplica ? (candados.cantidad ?? null) : null,
    firma_digital: firma.aplica ? 1 : 0,
  };
}

export function InstruccionesAdicionales() {
  const { reference, referencePayload, isLoading } = useOrdenFacturacion();

  const form = useForm<InstruccionesFormValues>({
    resolver: zodResolver(instruccionesSchema),
    defaultValues: { servicios: defaultServicios },
    mode: 'onChange',
  });

  const { fields } = useFieldArray({ control: form.control, name: 'servicios' });
  const watchedServicios = form.watch('servicios');

  React.useEffect(() => {
    const ia = referencePayload?.INSTRUCCIONES_ADICIONALES;
    if (!ia) return;

    form.reset({
      servicios: [
        {
          id: '1',
          concepto: 'Captura Fact. COVE',
          aplica: ia.CAPTURA_FACTURA_COVE === 1,
          importe: ia.CAPTURA_FACTURA_COVE_MONTO ?? 0,
        },
        {
          id: '2',
          concepto: 'Servicio Extraordinario AA',
          aplica: ia.EXTRAORDINARIO_AA === 1,
          importe: ia.EXTRAORDINARIO_AA_MONTO ?? 0,
        },
        {
          id: '3',
          concepto: 'Colocación de Candados Fiscales en Transporte',
          aplica: ia.CANDADOS_FISCALES === 1,
          importe: ia.CANDADOS_FISC_MONTO ?? 0,
          cantidad: ia.CANDADOS_FISC_CANT ?? 0,
        },
        {
          id: '4',
          concepto: 'Firma Digital',
          aplica: ia.FIRMA_DIGITAL === 1,
          importe: 0,
        },
      ],
    });
  }, [referencePayload]);

  const onSubmit = async (values: InstruccionesFormValues) => {
    try {
      const payload = toApiPayload(reference!, values.servicios);

      await GPClient.post('/dipp/agregarInstruccionAdicional', payload);

      toast.success('Instrucciones guardadas correctamente');
    } catch (err: any) {
      toast.error(err.message ?? 'Error inesperado');
    }
  };

  if (isLoading) return null;
  if (!reference || !referencePayload) return null;

  return (
    <OrdenFacturacionCard title="Instrucciones Adicionales">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Table>
            <TableHeader>
              <TableRow>
                {['Concepto', 'Aplica', 'Importe', 'Cantidad'].map((h) => (
                  <TableHead key={h} className="text-center">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((field, index) => {
                const aplica = watchedServicios[index]?.aplica ?? false;

                return (
                  <TableRow
                    key={field.id}
                    className={cn('transition-colors', !aplica && 'opacity-50')}
                  >
                    {/* Concepto */}
                    <TableCell className="font-medium text-sm">{field.concepto}</TableCell>

                    {/* Aplica */}
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <FormField
                          control={form.control}
                          name={`servicios.${index}.aplica`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Checkbox
                                  id={`aplica-${field.id}`}
                                  checked={f.value}
                                  onCheckedChange={f.onChange}
                                  className="data-[state=checked]:bg-[#1e2d3d] data-[state=checked]:border-[#1e2d3d]"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TableCell>

                    {/* Importe */}
                    <TableCell className="text-center">
                      <FormField
                        control={form.control}
                        name={`servicios.${index}.importe`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                value={f.value}
                                onChange={(e) => f.onChange(Number(e.target.value))}
                                className="w-20 text-right mx-auto h-8 text-sm"
                                disabled={!aplica}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-center" />
                          </FormItem>
                        )}
                      />
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell className="text-center">
                      {field.cantidad !== undefined ? (
                        <FormField
                          control={form.control}
                          name={`servicios.${index}.cantidad`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  value={f.value ?? 0}
                                  onChange={(e) => f.onChange(Number(e.target.value))}
                                  className="w-16 text-right mx-auto h-8 text-sm"
                                  disabled={!aplica}
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-center" />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4">
            <MyGPButtonSubmit disabled={form.formState.isSubmitting}>
              <SaveAllIcon />
              {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </MyGPButtonSubmit>
          </div>
        </form>
      </Form>
    </OrdenFacturacionCard>
  );
}
