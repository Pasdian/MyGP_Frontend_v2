'use client';

import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { COMPANY } from '@/lib/companies/companies';
import { ChevronDown, Loader2, Sheet } from 'lucide-react';
import React from 'react';
import { DateRange } from 'react-day-picker';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

type ReportConfig = {
  id: string;
  title: string;
  canSee: boolean;
  companyReportCode: string; // e.g. `${COMPANY.ODW_ELEKTRIK_MEXICO}_IMPO`
  prefix: string; // filename middle part: IMPO/EXPO/etc
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
  const { hasCompany } = useAuth();

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

  const reportFieldDescriptions: Array<{ field: string; description: string }> = [
    { field: 'REFERENCIA', description: 'Referencia del pedimento' },
    { field: 'FECHA_PAGO', description: 'Fecha de pago del pedimento' },
    { field: 'FECHA_ENTRADA', description: 'Fecha de entrada' },
    { field: 'TIPO_DE_CAMBIO', description: 'Tipo de cambio del pedimento' },
    { field: 'REGIMEN', description: 'Régimen aduanero' },
    { field: 'CLAVE', description: 'Clave de pedimento' },
    { field: 'PATENTE', description: 'Patente del agente aduanal' },
    { field: 'ADUANA', description: 'Aduana de despacho' },
    { field: 'SECCION', description: 'Sección de despacho' },
    { field: 'VALOR_SEGUROS', description: 'Valor seguros (base) MXN' },
    { field: 'SEGUROS', description: 'Importe de seguros' },
    { field: 'FLETES', description: 'Importe de fletes' },
    { field: 'EMBAL', description: 'Importe de embalaje' },
    { field: 'OTROS', description: 'Otros incrementables' },
    { field: 'PREV', description: 'Contribución PREV' },
    { field: 'DTA', description: 'Derecho de Trámite Aduanero (DTA)' },
    { field: 'NO_DE_FACTURA', description: 'Número de factura' },
    { field: 'FECHA_FACTURA', description: 'Fecha de la factura' },
    { field: 'NO_DE_COVE', description: 'Número de COVE' },
    { field: 'TIPO_CAMBIO_FACTURA', description: 'Tipo de cambio aplicado a factura' },
    { field: 'PROVEEDOR', description: 'Nombre del proveedor' },
    { field: 'TAXID', description: 'Tax ID del proveedor' },
    { field: 'INCOTERM', description: 'Incoterm de la operación' },
    { field: 'MONEDA_FACTURA', description: 'Moneda de la factura' },
    { field: 'FACTOR_MONEDA', description: 'Factor de conversión (moneda)' },
    { field: 'NUMERO_DE_PARTE', description: 'Número de parte' },
    { field: 'CANTIDAD_UMC', description: 'Cantidad UMC' },
    { field: 'UMC', description: 'Unidad de medida comercial' },
    { field: 'CANTIDAD_UMT', description: 'Cantidad UMT' },
    { field: 'UMT', description: 'Unidad de medida tarifa' },
    { field: 'VALOR_COMERCIAL_MONEDA_FACTURA', description: 'Valor comercial (moneda factura)' },
    { field: 'VALOR_COMERCIAL_USD', description: 'Valor comercial en USD' },
    { field: 'FRACCION', description: 'Fracción arancelaria' },
    { field: 'NICO', description: 'NICO' },
    { field: 'PAIS_ORIGEN', description: 'País de origen' },
    { field: 'METODO_VLORACION', description: 'Método de valoración' },
    { field: 'TASA_IVA', description: 'Tasa IVA' },
    { field: 'IVA_PAGADO', description: 'IVA pagado' },
    { field: 'IGI_PAGADO', description: 'IGI pagado' },
    { field: 'NUMERO_PARTIDA', description: 'Número de partida' },
    { field: 'VALOR_COMERCIAL_MXN', description: 'Valor comercial en MXN' },
    { field: 'VALOR_ADUANA', description: 'Valor en aduana' },
    { field: 'PO', description: 'Orden de compra (si aplica)' },
  ];

  const canSeeODW =
    hasCompany(COMPANY.AGENCIA_ADUANAL_PASCAL_SC) || hasCompany(COMPANY.ODW_ELEKTRIK_MEXICO);

  const initialDate = toYMDHMS(dateRange.fechaEntradaRange?.from);
  const finalDate = toYMDHMS(dateRange.fechaEntradaRange?.to);

  const reports: ReportConfig[] = React.useMemo(
    () => [
      {
        id: 'odw-impo',
        title: 'ODW ELEKTRIK MÉXICO - Importación',
        canSee: canSeeODW,
        companyReportCode: `${COMPANY.ODW_ELEKTRIK_MEXICO}_IMPO`,
        prefix: 'ODW_ELEKTRIK_MEXICO_IMPO',
      },
      {
        id: 'odw-expo',
        title: 'ODW ELEKTRIK MÉXICO - Exportación',
        canSee: canSeeODW,
        companyReportCode: `${COMPANY.ODW_ELEKTRIK_MEXICO}_EXPO`,
        prefix: 'ODW_ELEKTRIK_MEXICO_EXPO',
      },
      // Add more reports here...
    ],
    [canSeeODW]
  );

  // Per-report open state
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});
  const toggleOpen = React.useCallback((id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Per-report download state
  const [downloadingMap, setDownloadingMap] = React.useState<Record<string, boolean>>({});

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
    [finalDate, initialDate]
  );

  return (
    <div>
      <p className="font-semibold text-2xl mb-4">Reportes</p>

      <div className="w-[270px] mb-4">
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
      </div>

      <div className="space-y-3">
        {reports
          .filter((x) => x.canSee)
          .map((report) => {
            const isOpen = !!openMap[report.id];
            const isDownloading = !!downloadingMap[report.id];
            const canDownload = Boolean(initialDate && finalDate);

            return (
              <Card
                key={report.id}
                className="w-full cursor-pointer select-none"
                onClick={() => toggleOpen(report.id)}
              >
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <p className="text-xl font-bold truncate">{report.title}</p>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
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

                {isOpen && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="font-normal text-sm">
                      <p className="mb-2">Este reporte incluye las siguientes columnas:</p>

                      <div className="max-h-[500px] overflow-auto rounded-md border">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                              <TableHead className="font-bold w-[260px]">Campo</TableHead>
                              <TableHead className="font-bold">Descripción</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {reportFieldDescriptions.map((x) => (
                              <TableRow key={x.field}>
                                <TableCell className="font-semibold whitespace-nowrap">
                                  {x.field}
                                </TableCell>
                                <TableCell className="font-normal">{x.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
