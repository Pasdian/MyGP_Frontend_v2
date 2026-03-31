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
  disabled = false,
}: GenerarSolicitudDiariaReporteButtonProps) {
  const { getCasaUsername } = useAuth();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const effectiveReportContext = React.useMemo(
    () => reportContext ?? buildFallbackReportContext(fallbackRows, createdAtRange),
    [createdAtRange, fallbackRows, reportContext]
  );

  const handleDownload = async () => {
    const fallbackFilename = `solicitud_diaria_${effectiveReportContext.filters.createdAtFrom}_a_${effectiveReportContext.filters.createdAtTo}.pdf`;

    try {
      setIsDownloading(true);

      const response = await GPClient.post(
        '/pyapi/dipp/solicitudDiaria/report',
        {
          rows: effectiveReportContext.rows,
          filters: effectiveReportContext.filters,
          requestedBy: getCasaUsername()?.trim().toUpperCase() || 'MYGP',
          generatedAt: new Date().toISOString(),
        },
        { responseType: 'blob' }
      );

      const blob = response.data as Blob;

      if (!blob || blob.size === 0) {
        toast.error('El PDF del reporte está vacío');
        return;
      }

      const filename = getFilenameFromDisposition(
        response.headers?.['content-disposition'],
        fallbackFilename
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || fallbackFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success('Reporte descargado correctamente');
    } catch (error: unknown) {
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
      className="w-full justify-center border-slate-300 bg-white text-slate-800 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
    >
      {isDownloading ? <Loader2 className="animate-spin" /> : <FileDown />}
      <span>Generar Reporte</span>
    </Button>
  );
}
