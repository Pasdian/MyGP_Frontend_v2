'use client';

import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import type { SolicitudDiariaReportContext, SolicitudDiariaRow } from './types';

type GenerarSolicitudDiariaReporteButtonProps = {
  reportContext: SolicitudDiariaReportContext | null;
  fallbackRows: SolicitudDiariaRow[];
  createdAtRange: DateRange | undefined;
  saldoBancario: number | null;
  disabledReason?: string;
  disabled?: boolean;
};

const getTodayDateRange = (): DateRange => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    from: today,
    to: today,
  };
};

const formatDateParam = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getFilenameFromDisposition = (contentDisposition?: string, fallback?: string) => {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const plainMatch = contentDisposition.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return fallback;
};

const getErrorMessage = async (error: unknown, fallback: string) => {
  const axiosLikeError = error as {
    response?: {
      data?: Blob | { detail?: string; message?: string };
    };
  };

  const data = axiosLikeError.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text) as { detail?: string; message?: string };
      return parsed.detail || parsed.message || fallback;
    } catch {
      return fallback;
    }
  }

  return (
    (data as { detail?: string; message?: string } | undefined)?.detail ||
    (data as { detail?: string; message?: string } | undefined)?.message ||
    fallback
  );
};

const buildFallbackReportContext = (
  rows: SolicitudDiariaRow[],
  createdAtRange: DateRange | undefined
): SolicitudDiariaReportContext => {
  const todayDateRange = getTodayDateRange();
  const effectiveDateRange = createdAtRange ?? todayDateRange;
  const from = effectiveDateRange.from ?? todayDateRange.from ?? new Date();
  const to = effectiveDateRange.to ?? from;

  return {
    rows,
    filters: {
      createdAtFrom: formatDateParam(from),
      createdAtTo: formatDateParam(to),
      selectFilters: {
        tipoReferencia: 'ALL',
        tipoPago: 'ALL',
        tipo: 'ALL',
        concepto: 'ALL',
      },
      columnSearches: {
        CLIENT: '',
        TIPO_REFERENCIA: '',
        TIPO_PAGO: '',
        TIPO: '',
        CONCEPTO: '',
        NUMERO_REFERENCIA: '',
        INGRESO_ESTIMADO: '',
        INGRESO_REAL: '',
        DIFERENCIA: '',
        HAS_ANTICIPO: '',
        OBSERVACIONES: '',
        CREATED_BY: '',
        CREATED_AT: '',
        UPDATED_AT: '',
      },
    },
  };
};

export function GenerarSolicitudDiariaReporteButton({
  reportContext,
  fallbackRows,
  createdAtRange,
  saldoBancario,
  disabledReason,
  disabled = false,
}: GenerarSolicitudDiariaReporteButtonProps) {
  const { getCasaUsername } = useAuth();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const effectiveReportContext = React.useMemo(
    () => reportContext ?? buildFallbackReportContext(fallbackRows, createdAtRange),
    [createdAtRange, fallbackRows, reportContext]
  );

  const handleDownload = async () => {
    if (saldoBancario === null) {
      toast.error(disabledReason || 'Guarda el saldo bancario para generar el reporte');
      return;
    }

    const reportWindow = window.open('', '_blank');

    if (!reportWindow) {
      toast.error('No se pudo abrir la nueva pestaña del reporte');
      return;
    }

    try {
      setIsDownloading(true);

      reportWindow.document.write(`
      <html>
        <head>
          <title>Generando reporte...</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          Generando reporte...
        </body>
      </html>
    `);
      reportWindow.document.close();

      const response = await GPClient.post(
        '/pyapi/dipp/solicitudDiaria/report',
        {
          rows: effectiveReportContext.rows,
          filters: effectiveReportContext.filters,
          saldoBancario,
          requestedBy: getCasaUsername()?.trim().toUpperCase() || 'MYGP',
          generatedAt: new Date().toISOString(),
        },
        {
          responseType: 'text',
          headers: {
            Accept: 'text/html',
          },
        }
      );

      const html = typeof response.data === 'string' ? response.data : '';

      if (!html.trim()) {
        reportWindow.close();
        toast.error('El HTML del reporte está vacío');
        return;
      }

      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();

      toast.success('Reporte abierto en una nueva pestaña');
    } catch (error: unknown) {
      reportWindow.close();
      toast.error(await getErrorMessage(error, 'No se pudo generar el reporte'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      title={disabled ? disabledReason : undefined}
      className="h-11 w-full justify-center border-slate-300 bg-white text-slate-800 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
    >
      {isDownloading ? <Loader2 className="animate-spin" /> : <FileDown />}
      <span className="font-semibold tracking-wide">Generar Reporte</span>
    </Button>
  );
}
