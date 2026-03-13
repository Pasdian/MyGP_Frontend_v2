import React from 'react';
import useSWR from 'swr';
import { PlusIcon, SaveIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';

import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const formSchema = z.object({
  cuentaBancaria: z.string().min(1, 'Selecciona una cuenta bancaria'),
  numPoliza: z.string().min(1, 'La cuenta por pagar es obligatoria'),
  concepto: z.string().min(1, 'Selecciona un concepto'),
  beneficiario: z.string().min(1, 'Selecciona un beneficiario'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  factura: z.string().min(1, 'El número de factura es obligatorio'),
  client: z.string().min(1, 'Selecciona un cliente'),
  fechaProvision: z.string().min(1, 'La fecha de provisión es obligatoria'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
  fechaRevision: z.string().min(1, 'La fecha de revisión es obligatoria'),
  fechaFactura: z.string().min(1, 'La fecha de factura es obligatoria'),
  totalPagar: z
    .string()
    .min(1, 'El total a pagar es obligatorio')
    .refine((value) => !Number.isNaN(Number(value)), 'Ingresa un importe válido')
    .refine((value) => Number(value) > 0, 'El importe debe ser mayor a 0'),
});

type FormValues = z.infer<typeof formSchema>;

// Helper to apply red border only when that field has an error
const errorClass = (hasError: boolean) => (hasError ? 'border-red-500' : '');

export function AgregarProvision({ isAmericana = false }: { isAmericana?: boolean }) {
  const { getCasaUsername } = useAuth();
  const { reference, referencePayload } = useOrdenFacturacion();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const initialToday = new Date().toISOString().split('T')[0];

  const { data: conceptosData, isLoading: isConceptosLoading } = useSWR(
    '/dipp/conceptos',
    axiosFetcher
  );

  const { data: cuentasBancariasData, isLoading: isCuentasBancariasLoading } = useSWR(
    '/dipp/cuentas-bancarias',
    axiosFetcher
  );

  const { data: beneficiariosData, isLoading: isBeneficiariosLoading } = useSWR(
    '/dipp/beneficiarios',
    axiosFetcher
  );

  const { data: companiesData, isLoading: isCompaniesLoading } = useSWR(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );

  const cuentasBancariasOptions = React.useMemo(() => {
    if (!cuentasBancariasData) return [];
    return cuentasBancariasData.map((item: any) => ({
      value: String(item.CVE_CNTA),
      label: `${item.CVE_CNTA} - ${item.DES_CNTA}`,
    }));
  }, [cuentasBancariasData]);

  const beneficiariosOptions = React.useMemo(() => {
    if (!beneficiariosData) return [];
    return beneficiariosData.map((item: any) => ({
      value: String(item.CVE_BENE),
      label: `${item.CVE_BENE} - ${item.NOM_BENE}`,
    }));
  }, [beneficiariosData]);

  const companiesOptions = React.useMemo(() => {
    if (!companiesData) return [];
    return companiesData.map((company: any) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companiesData]);

  const conceptoProvisionOptions = React.useMemo(() => {
    if (!conceptosData) return [];
    return conceptosData.map((item: any) => ({
      value: String(item.CLAVE),
      label: `${item.CLAVE} - ${item.DESCRIPCION}`,
    }));
  }, [conceptosData]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cuentaBancaria: '03',
      numPoliza: '',
      beneficiario: isAmericana ? '00025' : '', // ← set default based on isAmericana
      descripcion: '',
      factura: '',
      concepto: '',
      client: referencePayload?.PROVISION?.[0]?.CVE_IMPO || '',
      fechaProvision: initialToday,
      fechaVencimiento: initialToday,
      fechaRevision: initialToday,
      fechaFactura: initialToday,
      totalPagar: '',
    },
  });

  React.useEffect(() => {
    reset({
      cuentaBancaria: '03',
      numPoliza: '',
      beneficiario: isAmericana ? '00025' : '',
      descripcion: '',
      factura: '',
      client: referencePayload?.PROVISION?.[0]?.CVE_IMPO || '',
      fechaProvision: initialToday,
      fechaVencimiento: initialToday,
      fechaRevision: initialToday,
      fechaFactura: initialToday,
      totalPagar: '',
    });
  }, [referencePayload, initialToday, reset, isAmericana]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        clave_cuenta: values.cuentaBancaria,
        clave_concepto: values.concepto,
        clave_beneficiario: values.beneficiario,
        descripcion: values.descripcion,
        referencia: reference,
        clave_cliente: values.client,
        fecha_provision: values.fechaProvision,
        fecha_vencimiento: values.fechaVencimiento,
        fecha_revision: values.fechaRevision,
        total_pagar: Number(values.totalPagar),
        factura: values.factura,
        tipo_poliza: 'CXP',
        periodo_poliza: yyyymm,
        num_poliza: values.numPoliza,
        concepto: values.concepto,
        usuario: getCasaUsername() || 'MYGP',
      };

      await GPClient.post('/dipp/agregarProvision', payload);
      toast.success('Se añadió la provisión exitosamente');

      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al subir la provisión', {
        description: 'Es probable que ya exista una referencia con ese Número de Poliza',
        classNames: {
          description: 'text-red-300',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Agregar Provisión"
      description="Aquí podrás provisionar."
      trigger={
        <MyGPButtonSubmit isSubmitting={isSubmitting}>
          <PlusIcon /> Provisionar
        </MyGPButtonSubmit>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="cuentaBancaria"
          render={({ field, fieldState }) => (
            <MyGPCombo
              id="cuentaBancaria"
              value={field.value}
              setValue={field.onChange}
              label="Cuenta Bancaria:"
              options={cuentasBancariasOptions}
              placeholder="Selecciona una cuenta bancaria"
              isModal={true}
              isLoading={isCuentasBancariasLoading}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              aria-invalid={!!fieldState.error}
              aria-errormessage={fieldState.error ? 'cuentaBancaria-error' : undefined}
            />
          )}
        />

        <div className="grid grid-rows gap-2">
          <Label>Período</Label>
          <Input value={yyyymm} disabled />
        </div>

        <div className="grid grid-rows gap-2">
          <Label htmlFor="factura">No. Factura</Label>
          <Input
            id="factura"
            {...register('factura')}
            placeholder="1234"
            aria-invalid={!!errors.factura}
            aria-errormessage={errors.factura ? 'factura-error' : undefined}
            className={errorClass(!!errors.factura)}
          />
          {errors.factura && (
            <p id="factura-error" className="text-sm text-red-500">
              {errors.factura.message}
            </p>
          )}
        </div>

        {isAmericana ? (
          <div className="grid gap-2">
            <Label htmlFor="beneficiario">Beneficiario (CUSTOMS & SHIPPING SERVICES INC)</Label>
            <Input
              id="beneficiario"
              defaultValue="00025"
              readOnly
              className="bg-muted cursor-not-allowed opacity-70"
              {...register('beneficiario')}
            />
          </div>
        ) : (
          <Controller
            control={control}
            name="beneficiario"
            render={({ field, fieldState }) => (
              <MyGPCombo
                id="beneficiario"
                value={field.value}
                setValue={field.onChange}
                label="Beneficiario:"
                options={beneficiariosOptions}
                placeholder="Selecciona un beneficiario"
                isModal={true}
                isLoading={isBeneficiariosLoading}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                aria-invalid={!!fieldState.error}
                aria-errormessage={fieldState.error ? 'beneficiario-error' : undefined}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="concepto"
          render={({ field, fieldState }) => (
            <MyGPCombo
              id="concepto"
              value={field.value}
              setValue={field.onChange}
              label="Concepto:"
              options={conceptoProvisionOptions}
              placeholder="Selecciona un concepto"
              isModal={true}
              isLoading={isConceptosLoading}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              aria-invalid={!!fieldState.error}
              aria-errormessage={fieldState.error ? 'concepto-error' : undefined}
            />
          )}
        />

        <div className="grid grid-rows gap-2">
          <Label htmlFor="fechaProvision">Fecha de la Provisión</Label>
          <Input
            id="fechaProvision"
            type="date"
            {...register('fechaProvision')}
            aria-invalid={!!errors.fechaProvision}
            aria-errormessage={errors.fechaProvision ? 'fechaProvision-error' : undefined}
            className={errorClass(!!errors.fechaProvision)}
          />
          {errors.fechaProvision && (
            <p id="fechaProvision-error" className="text-sm text-red-500">
              {errors.fechaProvision.message}
            </p>
          )}
        </div>

        <div className="grid grid-rows gap-2">
          <Label htmlFor="fechaRevision">Fecha de Revisión</Label>
          <Input
            id="fechaRevision"
            type="date"
            {...register('fechaRevision')}
            aria-invalid={!!errors.fechaRevision}
            aria-errormessage={errors.fechaRevision ? 'fechaRevision-error' : undefined}
            className={errorClass(!!errors.fechaRevision)}
          />
          {errors.fechaRevision && (
            <p id="fechaRevision-error" className="text-sm text-red-500">
              {errors.fechaRevision.message}
            </p>
          )}
        </div>

        <div className="grid grid-rows gap-2">
          <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
          <Input
            id="fechaVencimiento"
            type="date"
            {...register('fechaVencimiento')}
            aria-invalid={!!errors.fechaVencimiento}
            aria-errormessage={errors.fechaVencimiento ? 'fechaVencimiento-error' : undefined}
            className={errorClass(!!errors.fechaVencimiento)}
          />
          {errors.fechaVencimiento && (
            <p id="fechaVencimiento-error" className="text-sm text-red-500">
              {errors.fechaVencimiento.message}
            </p>
          )}
        </div>

        <div className="grid grid-rows gap-2">
          <Label>Tipo de Póliza</Label>
          <Input
            value="CXP"
            className="bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            disabled
          />
        </div>

        <div className="grid grid-rows gap-2">
          <Label htmlFor="numPoliza">Cuenta por Pagar:</Label>
          <Input
            id="numPoliza"
            {...register('numPoliza')}
            placeholder="CTAPAG"
            aria-invalid={!!errors.numPoliza}
            aria-errormessage={errors.numPoliza ? 'numPoliza-error' : undefined}
            className={errorClass(!!errors.numPoliza)}
          />
          {errors.numPoliza && (
            <p id="numPoliza-error" className="text-sm text-red-500">
              {errors.numPoliza.message}
            </p>
          )}
        </div>

        <Separator className="bg-slate-300 my-4 col-span-2" />

        <div className="grid grid-rows gap-2 col-span-2">
          <Label>Referencia:</Label>
          <Input
            value={reference}
            className="bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            disabled
          />
        </div>

        <div className="grid grid-rows gap-2 col-span-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            {...register('descripcion')}
            placeholder="Descripción.."
            aria-invalid={!!errors.descripcion}
            aria-errormessage={errors.descripcion ? 'descripcion-error' : undefined}
            className={errorClass(!!errors.descripcion)}
          />
          {errors.descripcion && (
            <p id="descripcion-error" className="text-sm text-red-500">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        <Controller
          control={control}
          name="client"
          render={({ field, fieldState }) => (
            <MyGPCombo
              id="client"
              value={field.value}
              setValue={field.onChange}
              label="Cliente:"
              options={companiesOptions}
              placeholder="Selecciona un cliente"
              isModal={true}
              isLoading={isCompaniesLoading}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              aria-invalid={!!fieldState.error}
              aria-errormessage={fieldState.error ? 'client-error' : undefined}
            />
          )}
        />

        <div className="grid grid-rows gap-2">
          <Label htmlFor="totalPagar">Total a Pagar:</Label>
          <Input
            id="totalPagar"
            {...register('totalPagar')}
            type="text"
            inputMode="decimal"
            placeholder="12345"
            aria-invalid={!!errors.totalPagar}
            aria-errormessage={errors.totalPagar ? 'totalFactura2-error' : undefined}
            className={errorClass(!!errors.totalPagar)}
          />
          {errors.totalPagar && (
            <p id="totalFactura2-error" className="text-sm text-red-500">
              {errors.totalPagar.message}
            </p>
          )}
        </div>

        <div className="grid grid-rows gap-2">
          <Label>Tasa IVA:</Label>
          <Input
            value="0.16"
            className="bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            disabled
          />
        </div>

        <div className="grid grid-rows gap-2">
          <Label htmlFor="fechaFactura">Fecha de la Factura</Label>
          <Input
            id="fechaFactura"
            type="date"
            {...register('fechaFactura')}
            aria-invalid={!!errors.fechaFactura}
            aria-errormessage={errors.fechaFactura ? 'fechaFactura-error' : undefined}
            className={errorClass(!!errors.fechaFactura)}
          />
          {errors.fechaFactura && (
            <p id="fechaFactura-error" className="text-sm text-red-500">
              {errors.fechaFactura.message}
            </p>
          )}
        </div>

        <div className="flex justify-end col-span-2">
          <MyGPButtonSubmit isSubmitting={isSubmitting} type="submit">
            <SaveIcon /> Guardar
          </MyGPButtonSubmit>
        </div>
      </form>
    </MyGPDialog>
  );
}
