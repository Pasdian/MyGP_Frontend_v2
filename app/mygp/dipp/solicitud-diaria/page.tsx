'use client';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { GenerarSolicitudDiariaReporteButton } from '@/components/solicitud-diaria/GenerarSolicitudDiariaReporteButton';
import { NuevaSolicitudDiaria } from '@/components/solicitud-diaria/NuevaSolicitudDiaria';
import {
  SolicitudesDiariasDataTable,
  type SolicitudDiariaReportContext,
  type SolicitudDiariaRow,
} from '@/components/solicitud-diaria/SolicitudesDiariasDataTable';
import { useAuth } from '@/hooks/useAuth';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { PERM } from '@/lib/modules/permissions';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { type DateRange } from 'react-day-picker';
import useSWR from 'swr';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatDateParam = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getSaldoBancarioError = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 'Debes capturar el saldo bancario';
  }

  const parsedValue = Number(normalizedValue);

  if (Number.isNaN(parsedValue)) {
    return 'Ingresa un saldo bancario válido';
  }

  if (parsedValue < 0) {
    return 'El saldo bancario no puede ser negativo';
  }

  return null;
};

const parseSaldoBancario = (value: string) => {
  const error = getSaldoBancarioError(value);

  if (error) {
    return null;
  }

  return Number(value.trim());
};

export default function SolicitudDiaria() {
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [createdAtRange, setCreatedAtRange] = React.useState<DateRange | undefined>(undefined);
  const [reportContext, setReportContext] = React.useState<SolicitudDiariaReportContext | null>(null);
  const [saldoBancarioInput, setSaldoBancarioInput] = React.useState('');
  const canGenerateReport = hasPermission(PERM.DIPP_SOLICITUDES_DIARIAS_ADMIN);
  const solicitudesDiariasUrl = React.useMemo(() => {
    const params = new URLSearchParams();

    if (createdAtRange?.from) {
      const to = createdAtRange.to ?? createdAtRange.from;
      params.set('created_at_from', formatDateParam(createdAtRange.from));
      params.set('created_at_to', formatDateParam(to));
    }

    const query = params.toString();
    return query ? `/pyapi/dipp/solicitudDiaria?${query}` : '/pyapi/dipp/solicitudDiaria';
  }, [createdAtRange]);

  const { data, mutate, isLoading, isValidating } = useSWR<SolicitudDiariaRow[]>(
    solicitudesDiariasUrl,
    axiosFetcher
  );
  const parsedSaldoBancario = React.useMemo(
    () => parseSaldoBancario(saldoBancarioInput),
    [saldoBancarioInput]
  );
  const saldoBancarioError = React.useMemo(
    () => getSaldoBancarioError(saldoBancarioInput),
    [saldoBancarioInput]
  );
  const reportButtonDisabledReason = saldoBancarioError || undefined;
  const saldoHelperMessage = saldoBancarioError
    ? saldoBancarioError
    : parsedSaldoBancario !== null
      ? 'Saldo bancario listo para generar el reporte.'
      : 'Ingresa el saldo bancario para habilitar el reporte.';

  return (
    <div className="grid gap-4">
      <div className={`grid w-full gap-3 ${canGenerateReport ? 'max-w-4xl' : 'sm:max-w-[220px]'}`}>
        <div className="w-full sm:w-[220px]">
          <MyGPDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            title="Nueva Solicitud"
            description="Aquí podrás añadir una nueva solicitud diaria de recursos operativos."
            trigger={
              <MyGPButtonPrimary className="h-11 w-full justify-center">
                <IconPlus stroke={2} />
                <span className="ml-1">Nueva Solicitud</span>
              </MyGPButtonPrimary>
            }
          >
            {isOpen && (
              <NuevaSolicitudDiaria
                onSuccess={() => {
                  setIsOpen(false);
                  void mutate();
                }}
              />
            )}
          </MyGPDialog>
        </div>

        {canGenerateReport ? (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-1">
                <Label htmlFor="saldo-bancario" className="font-semibold text-slate-800">
                  Saldo bancario
                </Label>
                <p className="text-xs text-slate-500">
                  Ingresa este valor para habilitar el reporte.
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
                <Input
                  id="saldo-bancario"
                  type="text"
                  inputMode="decimal"
                  placeholder="1234.56"
                  value={saldoBancarioInput}
                  aria-invalid={!!saldoBancarioError}
                  className="h-11"
                  onChange={(event) => {
                    setSaldoBancarioInput(event.target.value);
                  }}
                />
                <GenerarSolicitudDiariaReporteButton
                  reportContext={reportContext}
                  fallbackRows={data ?? []}
                  createdAtRange={createdAtRange}
                  saldoBancario={parsedSaldoBancario}
                  disabledReason={reportButtonDisabledReason}
                  disabled={isLoading || isValidating || parsedSaldoBancario === null}
                />
              </div>

              <p
                className={`text-sm ${
                  saldoBancarioError
                    ? 'text-red-600'
                    : parsedSaldoBancario !== null
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                }`}
              >
                {saldoHelperMessage}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {!isLoading && (
        <SolicitudesDiariasDataTable
          data={data ?? []}
          createdAtRange={createdAtRange}
          setCreatedAtRange={setCreatedAtRange}
          onReportContextChange={setReportContext}
        />
      )}
    </div>
  );
}
