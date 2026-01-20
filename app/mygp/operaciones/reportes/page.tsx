'use client';

import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { COMPANY } from '@/lib/companies/companies';
import { ChevronDown, Loader2, Sheet } from 'lucide-react';
import React from 'react';
import { DateRange } from 'react-day-picker';
import useSWR from 'swr';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { customsMap } from '@/lib/customs/customs';
import { Card } from '@/components/ui/card';

type ReportConfig = {
  id: string;
  title: string;
  canSee: boolean;
  companyReportCode: string; // e.g. `${COMPANY.ODW_ELEKTRIK_MEXICO}_IMPO`
  prefix: string; // filename middle part: IMPO/EXPO/etc
};

function toYMD(d?: Date) {
  return d ? d.toISOString().split('T')[0] : undefined;
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
      fechaEntradaRange: { from: oneMonthAgo, to: today },
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

  const csvColumnLabels: Record<string, string> = React.useMemo(
    () => Object.fromEntries(reportFieldDescriptions.map((x) => [x.field, x.description])),
    [reportFieldDescriptions]
  );

  const shouldIncludeFieldInCsv = (key: string) => !key.endsWith('_BIN');

  const escapeCsv = React.useCallback((value: unknown, field?: string) => {
    if (value === null || value === undefined) return '';

    let s = String(value);

    if (field === 'ADUANA') {
      s = customsMap[s] ?? s;
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
      const [y, m, d] = s.split('T')[0].split('-');
      s = `${d}/${m}/${y}`;
    }

    s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    if (s.includes('"')) s = s.replace(/"/g, '""');

    if (/[",\n]/.test(s)) s = `"${s}"`;

    return s;
  }, []);

  const convertToCsv = React.useCallback(
    async (args: { data: unknown; filenamePrefix: string }) => {
      const { data, filenamePrefix } = args;
      const rows: Array<Record<string, unknown>> = Array.isArray(data) ? data : [];
      if (rows.length === 0) return;

      const desiredOrder = reportFieldDescriptions.map((x) => x.field);

      const keysFromData = new Set<string>();
      for (const r of rows) Object.keys(r ?? {}).forEach((k) => keysFromData.add(k));

      const headerKeys: string[] = desiredOrder.filter(
        (k) => keysFromData.has(k) && shouldIncludeFieldInCsv(k)
      );

      const extras = Array.from(keysFromData)
        .filter((k) => !desiredOrder.includes(k))
        .filter(shouldIncludeFieldInCsv)
        .sort();

      headerKeys.push(...extras);

      const csvLines: string[] = [];
      csvLines.push(headerKeys.map((key) => escapeCsv(csvColumnLabels[key] || key)).join(','));

      for (const r of rows) {
        csvLines.push(headerKeys.map((k) => escapeCsv((r as any)[k], k)).join(','));
      }

      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const from = toYMD(dateRange.fechaEntradaRange?.from) ?? 'NA';
      const to = toYMD(dateRange.fechaEntradaRange?.to) ?? 'NA';
      const filename = `${filenamePrefix}_${from}_a_${to}.csv`;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [csvColumnLabels, dateRange.fechaEntradaRange, escapeCsv, reportFieldDescriptions]
  );

  const canSeeODW =
    hasCompany(COMPANY.AGENCIA_ADUANAL_PASCAL_SC) || hasCompany(COMPANY.ODW_ELEKTRIK_MEXICO);

  const initialDate = toYMD(dateRange.fechaEntradaRange?.from);
  const finalDate = toYMD(dateRange.fechaEntradaRange?.to);

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

  // Per-report converting state
  const [convertingMap, setConvertingMap] = React.useState<Record<string, boolean>>({});

  // SWR for each report (map)
  const swrByReport = reports.map((r) => {
    const key =
      r.canSee && initialDate && finalDate
        ? `/api/companies/report/${r.companyReportCode}?initialDate=${initialDate}&finalDate=${finalDate}`
        : null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const swr = useSWR(key, axiosFetcher);
    return { report: r, ...swr };
  });

  return (
    <div>
      <p className="font-semibold text-2xl mb-4">Reportes</p>

      <div className="w-[270px] mb-4">
        <MyGPCalendar
          dateRange={dateRange.fechaEntradaRange}
          setDateRange={(value) => setDateRange((prev) => ({ ...prev, fechaEntradaRange: value }))}
          label="Fecha de Entrada"
        />
      </div>

      <div className="space-y-3">
        {swrByReport
          .filter((x) => x.report.canSee)
          .map(({ report, data, isLoading }) => {
            const isOpen = !!openMap[report.id];
            const isConverting = !!convertingMap[report.id];
            const canExport = Array.isArray(data) && data.length > 0;

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
                      try {
                        setConvertingMap((prev) => ({ ...prev, [report.id]: true }));
                        await convertToCsv({ data, filenamePrefix: report.prefix });
                      } finally {
                        setConvertingMap((prev) => ({ ...prev, [report.id]: false }));
                      }
                    }}
                    disabled={!canExport || isConverting || isLoading}
                  >
                    {isLoading || isConverting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Cargando...</span>
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
