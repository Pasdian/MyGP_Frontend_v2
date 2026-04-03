'use client';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { GenerarSolicitudDiariaReporteButton } from '@/components/solicitud-diaria/GenerarSolicitudDiariaReporteButton';
import { NuevaSolicitudDiaria } from '@/components/solicitud-diaria/NuevaSolicitudDiaria';
import {
  SolicitudesDiariasDataTable,
  type SolicitudDiariaReportContext,
  type SolicitudDiariaRow,
} from '@/components/solicitud-diaria/SolicitudesDiariasDataTable';
import { useAuth } from '@/hooks/useAuth';
import { GPClient, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { PERM } from '@/lib/modules/permissions';
import { IconPlus } from '@tabler/icons-react';
import { toast } from 'sonner';
import React from 'react';
import { type DateRange } from 'react-day-picker';
import useSWR, { useSWRConfig } from 'swr';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
  const [selectedSaldoId, setSelectedSaldoId] = React.useState('');
  const [isSavingSaldo, setIsSavingSaldo] = React.useState(false);
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

  const { mutate: mutateCache } = useSWRConfig();
  const { data, isLoading, isValidating } = useSWR<SolicitudDiariaRow[]>(
    solicitudesDiariasUrl,
    axiosFetcher
  );
  const { data: saldosGuardados, mutate: mutateSaldosGuardados } = useSWR<
    Array<{
      ID_SALDO: number;
      SALDO_BANCARIO: number;
      CREATED_AT: string;
      CREATED_AT_FMT?: string;
    }>
  >(
    canGenerateReport ? '/pyapi/dipp/solicitudDiaria/saldoBancario' : null,
    axiosFetcher
  );
  const rows = React.useMemo(() => data ?? [], [data]);
  const savedSaldos = React.useMemo(() => saldosGuardados ?? [], [saldosGuardados]);
  const savedSaldosOptions = React.useMemo(
    () =>
      savedSaldos.map((saldo) => ({
        value: String(saldo.ID_SALDO),
        label: `${saldo.CREATED_AT_FMT || saldo.CREATED_AT} - ${Number(
          saldo.SALDO_BANCARIO || 0
        ).toLocaleString('es-MX', {
          style: 'currency',
          currency: 'MXN',
        })}`,
      })),
    [savedSaldos]
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
  const savedSaldosHelperText = savedSaldosOptions.length
    ? 'Selecciona un saldo guardado para cargarlo en el campo.'
    : 'Aún no hay saldos guardados.';

  const handleGuardarSaldoBancario = React.useCallback(async () => {
    if (parsedSaldoBancario === null) {
      toast.error(saldoBancarioError || 'Ingresa un saldo bancario válido');
      return;
    }

    try {
      setIsSavingSaldo(true);
      const response = await GPClient.post('/pyapi/dipp/solicitudDiaria/saldoBancario', {
        saldoBancario: parsedSaldoBancario,
      });
      const savedId = String(
        (response.data as { id_saldo?: number } | undefined)?.id_saldo ?? ''
      );
      await mutateSaldosGuardados();
      if (savedId) {
        setSelectedSaldoId(savedId);
      }
      toast.success('Saldo bancario guardado correctamente');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      toast.error(apiError.response?.data?.detail || 'No se pudo guardar el saldo bancario');
    } finally {
      setIsSavingSaldo(false);
    }
  }, [mutateSaldosGuardados, parsedSaldoBancario, saldoBancarioError]);

  const revalidateSolicitudesDiarias = React.useCallback(async () => {
    await mutateCache(
      (key) => typeof key === 'string' && key.startsWith('/pyapi/dipp/solicitudDiaria')
    );
  }, [mutateCache]);

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
                  void revalidateSolicitudesDiarias();
                }}
              />
            )}
          </MyGPDialog>
        </div>

        {canGenerateReport ? (
          <div className="grid gap-3">
            <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-1">
                <Label htmlFor="saldo-bancario" className="font-semibold text-slate-800">
                  Saldo bancario
                </Label>
                <p className="text-xs text-slate-500">
                  1) Captura el saldo y presiona Guardar. 2) Reutiliza saldos guardados o genera
                  el reporte con el valor actual.
                </p>
              </div>

              <div className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Paso 1: Captura y guarda
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
                <Input
                  id="saldo-bancario"
                  type="text"
                  inputMode="decimal"
                  placeholder="1234.56"
                  value={saldoBancarioInput}
                  aria-invalid={!!saldoBancarioError}
                  className="h-11"
                  onChange={(event) => {
                    setSelectedSaldoId('');
                    setSaldoBancarioInput(event.target.value);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full self-end"
                  onClick={handleGuardarSaldoBancario}
                  disabled={parsedSaldoBancario === null || isSavingSaldo}
                >
                  {isSavingSaldo ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>

              <div className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Paso 2: Reutiliza o genera reporte
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
                <MyGPCombo
                  id="saldo-bancario-guardado"
                  label="Saldos guardados (opcional)"
                  value={selectedSaldoId}
                  setValue={(value) => {
                    setSelectedSaldoId(value);
                    const selected = savedSaldos.find((saldo) => String(saldo.ID_SALDO) === value);
                    if (!selected) {
                      return;
                    }

                    setSaldoBancarioInput(String(selected.SALDO_BANCARIO));
                  }}
                  options={savedSaldosOptions}
                  placeholder="Selecciona un saldo bancario"
                  className="h-11"
                  disabled={!savedSaldosOptions.length}
                  helperText={savedSaldosHelperText}
                />
                <GenerarSolicitudDiariaReporteButton
                  reportContext={reportContext}
                  fallbackRows={rows}
                  createdAtRange={createdAtRange}
                  saldoBancario={parsedSaldoBancario}
                  disabledReason={reportButtonDisabledReason}
                  disabled={isLoading || isValidating || parsedSaldoBancario === null}
                  className="sm:self-center"
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
          data={rows}
          createdAtRange={createdAtRange}
          setCreatedAtRange={setCreatedAtRange}
          onReportContextChange={setReportContext}
        />
      )}
    </div>
  );
}
