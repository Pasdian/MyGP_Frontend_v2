'use client';

import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { COMPANY } from '@/lib/companies/companies';
import { Loader2, Sheet } from 'lucide-react';
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

export default function Reportes() {
  const { hasCompany } = useAuth();
  const [isConvertingToCsv, setIsConvertingToCsv] = React.useState(false);

  const [dateRange, setDateRange] = React.useState<{
    fechaEntradaRange: DateRange | undefined;
  }>(() => {
    const now = new Date();

    // today (normalized)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // same day, previous month
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      fechaEntradaRange: { from: oneMonthAgo, to: today },
    };
  });

  const { data, isLoading } = useSWR(
    dateRange.fechaEntradaRange &&
      `/api/companies/report/${COMPANY.ODW_ELEKTRIK_MEXICO}?initialDate=${
        dateRange.fechaEntradaRange.from?.toISOString().split('T')[0]
      }&finalDate=${dateRange.fechaEntradaRange.to?.toISOString().split('T')[0]}`,
    axiosFetcher
  );

  // Option 3: fields shown to user (also used to drive CSV ordering + labels)
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

  // Map API field -> human-readable CSV column header
  // Using the description as the human-readable label (Option 3)
  const csvColumnLabels: Record<string, string> = React.useMemo(
    () => Object.fromEntries(reportFieldDescriptions.map((x) => [x.field, x.description])),
    [reportFieldDescriptions]
  );

  // Hide internal/binary fields from CSV (e.g. IDENTIFICADORES_PARTIDAS_BIN)
  const shouldIncludeFieldInCsv = (key: string) => !key.endsWith('_BIN');

  const convertToCsv = async () => {
    try {
      setIsConvertingToCsv(true);

      const rows: Array<Record<string, unknown>> = Array.isArray(data) ? data : [];
      if (rows.length === 0) return;

      // Build stable CSV column order:
      // 1) fields in reportFieldDescriptions that actually exist in data
      // 2) any extra fields returned by API (excluding *_BIN), sorted
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

      const escapeCsv = (value: unknown, field?: string) => {
        if (value === null || value === undefined) return '';

        let s = String(value);

        // Map ADUANA code → name
        if (field === 'ADUANA') {
          s = customsMap[s] ?? s;
        }

        // ISO date → dd/mm/yyyy
        if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
          const [y, m, d] = s.split('T')[0].split('-');
          s = `${d}/${m}/${y}`;
        }

        // Normalize newlines
        s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Escape quotes
        if (s.includes('"')) s = s.replace(/"/g, '""');

        // Wrap if needed
        if (/[",\n]/.test(s)) s = `"${s}"`;

        return s;
      };

      const csvLines: string[] = [];

      // Human readable headers
      csvLines.push(
        headerKeys
          .map((key) => escapeCsv(csvColumnLabels[key] || key)) // description first
          .join(',')
      );
      // Rows
      for (const r of rows) {
        csvLines.push(headerKeys.map((k) => escapeCsv((r as any)[k], k)).join(','));
      }

      const csvContent = csvLines.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const from = dateRange.fechaEntradaRange?.from?.toISOString().split('T')[0] ?? 'NA';
      const to = dateRange.fechaEntradaRange?.to?.toISOString().split('T')[0] ?? 'NA';
      const filename = `ODW_ELEKTRIK_MEXICO_${from}_a_${to}.csv`;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsConvertingToCsv(false);
    }
  };

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

      <div>
        {(hasCompany(COMPANY.AGENCIA_ADUANAL_PASCAL_SC) ||
          hasCompany(COMPANY.ODW_ELEKTRIK_MEXICO)) && (
          <div className="font-bold">
            <p className="text-xl">ODW ELEKTRIK MÉXICO</p>

            <div className="mt-2">
              {isLoading ? (
                <div className="flex space-x-2 items-center text-sm font-normal">
                  <Loader2 className="animate-spin" />
                  <p>Cargando datos...</p>
                </div>
              ) : (
                Array.isArray(data) &&
                data.length > 0 && (
                  <Button
                    className="bg-green-500 font-bold hover:bg-green-700 hover:text-white cursor-pointer text-white w-[200px]"
                    onClick={convertToCsv}
                    disabled={isConvertingToCsv || isLoading}
                  >
                    {isConvertingToCsv ? (
                      <div className="flex space-x-2 items-center">
                        <Loader2 className="animate-spin" />
                        <p>Cargando...</p>
                      </div>
                    ) : (
                      <div className="flex space-x-2 items-center">
                        <Sheet className="mr-2 h-4 w-4" />
                        <p>Exportar Tabla a CSV</p>
                      </div>
                    )}
                  </Button>
                )
              )}
            </div>

            {/* Field description table */}
            <div className="mt-4 mb-3 font-normal text-sm">
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
                        <TableCell className="font-semibold whitespace-nowrap">{x.field}</TableCell>
                        <TableCell>{x.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
