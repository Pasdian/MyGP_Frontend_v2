'use client';

import * as React from 'react';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import type { FolioRow } from '@/types/transbel/folioData';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod/v4';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, SaveAllIcon, SearchIcon, XCircle } from 'lucide-react';

const formSchema = z.object({
  reference: z.string().min(1, 'Ingresa una referencia'),
});

type FormValues = z.infer<typeof formSchema>;
type DatosEmbarqueResponse = FolioRow[];
type ResolvedAddendaSelection = {
  addenda: string | null;
  etiImpr: string | null;
};
type XmlCheckResult = {
  exists: boolean;
  filename: string | null;
};

function resolveAddendaSelection(rows: DatosEmbarqueResponse): ResolvedAddendaSelection {
  const cecoRow = rows.find((row) => row.ETI_IMPR === 'CECO' && row.DAT_EMB);
  const cuentaRow = rows.find((row) => row.ETI_IMPR === 'CUENTA' && row.DAT_EMB);

  if (cecoRow && cuentaRow) {
    return {
      addenda: `${cecoRow.DAT_EMB} ${cuentaRow.DAT_EMB}`,
      etiImpr: 'CECO/CUENTA',
    };
  }

  const firstNonEmptyRow = rows.find((row) => row.DAT_EMB);
  return {
    addenda: firstNonEmptyRow?.DAT_EMB ?? null,
    etiImpr: firstNonEmptyRow?.ETI_IMPR ?? null,
  };
}

export default function Addenda() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { reference: '' },
    mode: 'onChange',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAddendando, setIsAddendando] = React.useState(false);
  const [embarqueData, setEmbarqueData] = React.useState<DatosEmbarqueResponse | null>(null);
  const [addenda, setAddenda] = React.useState<string | null>(null);
  const [selectedEtiImpr, setSelectedEtiImpr] = React.useState<string | null>(null);
  const [xmlCheck, setXmlCheck] = React.useState<XmlCheckResult | null>(null);
  const reference = form.watch('reference');

  React.useEffect(() => {
    setEmbarqueData(null);
    setAddenda(null);
    setSelectedEtiImpr(null);
    setXmlCheck(null);
  }, [reference, form]);

  const onSearchReference = async () => {
    const isReferenceValid = await form.trigger('reference');
    if (!isReferenceValid) return;

    setIsSubmitting(true);
    setEmbarqueData(null);
    setXmlCheck(null);

    try {
      const normalizedReference = form.getValues('reference').trim().toUpperCase();
      const [embarqueResponse, xmlCheckResponse] = await Promise.all([
        GPClient.get<DatosEmbarqueResponse>('/pyapi/transbel/datosEmbarque', {
          params: { reference: normalizedReference },
        }),
        GPClient.get<XmlCheckResult>('/pyapi/dea/fileExists', {
          params: {
            client: '005009',
            reference: normalizedReference,
            path: String.raw`/01-CTA-GASTOS/2Fact.*\.xml$`,
          },
        }),
      ]);
      const data = embarqueResponse.data;
      const selection = resolveAddendaSelection(data);

      setEmbarqueData(data);
      setAddenda(selection.addenda);
      setSelectedEtiImpr(selection.etiImpr);
      setXmlCheck(xmlCheckResponse.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'No se encontró la referencia'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddendar = async () => {
    if (!xmlCheck?.exists || !xmlCheck.filename) {
      toast.error('No se encontró el archivo a addendar');
      return;
    }

    if (!addenda) {
      toast.error('No se resolvió la addenda');
      return;
    }

    if (!selectedEtiImpr) {
      toast.error('No se resolvió el ETI_IMPR');
      return;
    }

    setIsAddendando(true);

    try {
      const { data } = await GPClient.post('/pyapi/transbel/addendar', {
        client: '005009',
        reference: form.getValues('reference').trim().toUpperCase(),
        eti_impr: selectedEtiImpr,
        addenda,
        filename: xmlCheck.filename,
      });
      toast.success(data?.detail || 'Archivo addendado correctamente');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || error?.response?.data?.message || 'Error al addendar'
      );
    } finally {
      setIsAddendando(false);
    }
  };

  return (
    <div className="grid gap-4">
      <form className="grid gap-4">
        <Field data-invalid={!!form.formState.errors.reference}>
          <FieldLabel htmlFor="reference">
            <SearchIcon /> Buscar referencia
          </FieldLabel>
          <Input
            id="reference"
            placeholder="Ingresa la referencia"
            aria-invalid={!!form.formState.errors.reference}
            {...form.register('reference')}
          />
          {form.formState.errors.reference ? (
            <FieldError errors={[form.formState.errors.reference]} />
          ) : null}
        </Field>

        <div>
          <MyGPButtonSubmit type="button" isSubmitting={isSubmitting} onClick={onSearchReference}>
            <SearchIcon /> {embarqueData ? 'Buscar otra vez' : 'Buscar referencia'}
          </MyGPButtonSubmit>
        </div>

        {embarqueData ? (
          <div className="grid gap-4">
            <DatosEmbarqueTable rows={embarqueData} />
            <XmlCheckTable result={xmlCheck} />
            {xmlCheck?.exists ? (
              <div>
                <MyGPButtonSubmit
                  type="button"
                  isSubmitting={isAddendando}
                  isSubmittingText="Addendando"
                  onClick={onAddendar}
                >
                  <SaveAllIcon />
                  Addendar
                </MyGPButtonSubmit>
              </div>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}

function XmlCheckTable({
  result,
}: {
  result: XmlCheckResult | null;
}) {
  const found = !!result?.exists;

  return (
    <Card className="w-full">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead className="text-center w-24">Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-sm font-medium">{result?.filename ?? '-'}</TableCell>
              <TableCell className="text-center">
                {found ? (
                  <CheckCircle2 className="inline-block text-emerald-500" size={18} />
                ) : (
                  <XCircle className="inline-block text-rose-500" size={18} />
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DatosEmbarqueTable({
  rows,
}: {
  rows: DatosEmbarqueResponse;
}) {
  return (
    <Card className="w-full">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referencia</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dato de Embarque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${row.NUM_REFE ?? 'sin-ref'}-${row.CVE_DAT ?? index}-${row.ETI_IMPR ?? 'sin-tipo'}`}>
                  <TableCell>{row.NUM_REFE ?? '-'}</TableCell>
                  <TableCell>{row.CVE_DAT ?? '-'}</TableCell>
                  <TableCell>{row.ETI_IMPR ?? '-'}</TableCell>
                  <TableCell>{row.DAT_EMB ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
