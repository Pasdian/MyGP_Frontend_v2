'use client';

import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { Loader2, Sheet } from 'lucide-react';
import React from 'react';
import { DateRange } from 'react-day-picker';
import { useCompanies } from '@/hooks/useCompanies';
import { MyGPComboMulti } from '@/components/MyGPUI/Combobox/MyGPComboMulti';
import { toast } from 'sonner';
import { customs } from '@/lib/customs/customs';
import { patentes } from '@/lib/customs/patentes';

type ReportConfig = {
  id: string;
  title: string;
  companyReportCode: string;
  prefix: string;
};

function toYMDHMS(d?: Date) {
  if (!d) return undefined;

  const pad = (n: number) => String(n).padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 0);
  return x;
}

function normalizeRange(range?: DateRange): DateRange | undefined {
  if (!range?.from) return range;

  const from = startOfDay(range.from);
  const to = endOfDay(range.to ?? range.from);

  return { from, to };
}

function getFilenameFromDisposition(contentDisposition?: string, fallback?: string) {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const plainMatch = contentDisposition.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) return plainMatch[1].trim();

  return fallback;
}

export default function Reportes() {
  const [dateRange, setDateRange] = React.useState<{
    fechaEntradaRange: DateRange | undefined;
  }>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      fechaEntradaRange: normalizeRange({ from: oneMonthAgo, to: today }),
    };
  });

  const [clientNumbers, setClientNumbers] = React.useState<string[]>([]);
  const [customsNumbers, setCustomsNumbers] = React.useState<string[]>([]);
  const [patenteNumbers, setPatenteNumbers] = React.useState<string[]>([]);

  const { rows: companies } = useCompanies();

  const reports: ReportConfig[] = React.useMemo(
    () => [
      {
        id: 'FACTURAS_POR_COBRAR',
        title: 'Facturas por Cobrar',
        companyReportCode: 'FACTURAS_POR_COBRAR',
        prefix: 'FACTURAS_POR_COBRAR',
      },
      {
        id: 'FACTURAS_POR_PAGAR',
        title: 'Facturas por Pagar',
        companyReportCode: 'FACTURAS_POR_PAGAR',
        prefix: 'FACTURAS_POR_PAGAR',
      },
      {
        id: 'ACUMULADO_DE_COBRANZA',
        title: 'Acumulado de Cobranza',
        companyReportCode: 'ACUMULADO_DE_COBRANZA',
        prefix: 'ACUMULADO_DE_COBRANZA',
      },
      {
        id: 'CFDI_PAGO_MULTIPLE',
        title: 'Generación de Comprobante CFDI de Pago Múltiple',
        companyReportCode: 'CFDI_PAGO_MULTIPLE',
        prefix: 'CFDI_PAGO_MULTIPLE',
      },
      {
        id: 'COMPLEMENTOS_PAGO_SATO',
        title: 'Reporte de complementos de pago SATO',
        companyReportCode: 'COMPLEMENTOS_PAGO_SATO',
        prefix: 'COMPLEMENTOS_PAGO_SATO',
      },
      {
        id: 'COBRANZA_ACUMULADA_SATO',
        title: 'Cobranza Acumulada SATO',
        companyReportCode: 'COBRANZA_ACUMULADA_SATO',
        prefix: 'COBRANZA_ACUMULADA_SATO',
      },
    ],
    []
  );

  const initialDate = toYMDHMS(dateRange.fechaEntradaRange?.from);
  const finalDate = toYMDHMS(dateRange.fechaEntradaRange?.to);

  const [downloadingMap, setDownloadingMap] = React.useState<Record<string, boolean>>({});

  const companiesOptions = React.useMemo(() => {
    return companies.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companies]);

  // Convert customs into {label,value}
  const customsOptions = React.useMemo(() => {
    return customs.map((c) => ({
      label: c.name,
      value: c.key,
      code: c.code,
    }));
  }, []);

  const clearClients = React.useCallback(() => setClientNumbers([]), []);
  const clearPatentes = React.useCallback(() => setPatenteNumbers([]), []);
  const clearCustoms = React.useCallback(() => setCustomsNumbers([]), []);

  const downloadReport = React.useCallback(
    async (report: ReportConfig) => {
      if (!initialDate || !finalDate) return;

      const fallbackFilename = `${report.prefix}_${initialDate}_a_${finalDate}.csv`;

      setDownloadingMap((prev) => ({ ...prev, [report.id]: true }));
      try {
        const response = await GPClient.post(
          `/api/companies/report/${report.companyReportCode}`,
          {
            initialDate,
            finalDate,
            clients: clientNumbers,
            patentes: patenteNumbers,
            customs: customsNumbers,
          },
          { responseType: 'blob' }
        );

        const blob = response.data as Blob;

        if (!blob || blob.size === 0) {
          toast.error('El CSV está vacío');
          return;
        }

        try {
          const text = await blob.text();
          const trimmed = text.trim();

          if (!trimmed) {
            toast.error('El CSV está vacío');
            return;
          }

          const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length <= 1) {
            toast.error('El CSV no tiene datos', {
              description: 'El archivo contiene solo encabezados (sin registros).',
            });
            return;
          }
        } catch {
          // keep blob.size check only
        }

        const disposition = response.headers?.['content-disposition'] as string | undefined;
        const filename =
          getFilenameFromDisposition(disposition, fallbackFilename) ?? fallbackFilename;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err: any) {
        toast.error('Error al descargar el reporte', {
          description: err?.message ?? 'Intenta nuevamente.',
        });
        throw err;
      } finally {
        setDownloadingMap((prev) => ({ ...prev, [report.id]: false }));
      }
    },
    // IMPORTANT: include ALL used state so you don't send stale arrays
    [finalDate, initialDate, clientNumbers, patenteNumbers, customsNumbers]
  );

  return (
    <div>
      <p className="font-semibold text-2xl mb-4">Reportes</p>

      <div className="w-[420px] mb-4 space-y-3">
        <MyGPCalendar
          dateRange={dateRange.fechaEntradaRange}
          setDateRange={(value) =>
            setDateRange((prev) => ({
              ...prev,
              fechaEntradaRange: normalizeRange(value),
            }))
          }
          label="Fecha"
        />

        <div className="flex items-end gap-2">
          <MyGPComboMulti
            options={companiesOptions}
            values={clientNumbers}
            setValues={setClientNumbers}
            label="Clientes:"
            placeholder="Selecciona uno o varios clientes"
            showValue
            className="flex-1"
          />

          <Button
            type="button"
            variant="outline"
            onClick={clearClients}
            disabled={clientNumbers.length === 0}
          >
            Limpiar
          </Button>
        </div>

        <div className="flex items-end gap-2">
          <MyGPComboMulti
            options={patentes}
            values={patenteNumbers}
            setValues={setPatenteNumbers}
            label="Patentes:"
            placeholder="Selecciona una o varias patentes"
            showValue
            className="flex-1"
          />

          <Button
            type="button"
            variant="outline"
            onClick={clearPatentes}
            disabled={patenteNumbers.length === 0}
          >
            Limpiar
          </Button>
        </div>

        <div className="flex items-end gap-2">
          <MyGPComboMulti
            options={customsOptions}
            values={customsNumbers}
            setValues={setCustomsNumbers}
            label="Aduanas:"
            placeholder="Selecciona una o varias aduanas"
            showValue
            className="flex-1"
          />

          <Button
            type="button"
            variant="outline"
            onClick={clearCustoms}
            disabled={customsNumbers.length === 0}
          >
            Limpiar
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((report) => {
          const isDownloading = !!downloadingMap[report.id];
          const canDownload = Boolean(initialDate && finalDate);

          return (
            <Card key={report.id} className="w-full">
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <p className="text-xl font-bold truncate">{report.title}</p>
                </div>

                <Button
                  className="bg-green-500 font-bold hover:bg-green-700 text-white w-[200px]"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await downloadReport(report);
                  }}
                  disabled={!canDownload || isDownloading}
                >
                  {isDownloading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Descargando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sheet className="h-4 w-4" />
                      <span>Descargar CSV</span>
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
