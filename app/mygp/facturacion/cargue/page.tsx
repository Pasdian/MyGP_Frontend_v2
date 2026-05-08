'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import React from 'react';

const OPERATION_LABELS: Record<string, string> = {
  expo: 'Exportación',
  impo: 'Importación',
};

const ACTION_LABELS: Record<string, string> = {
  enviar: 'Enviar a FTP',
  regenerar: 'Regenerar Cargue',
};

const ACTION_DESCRIPTIONS: Record<string, string> = {
  enviar: 'Se enviará el CSV y los PDFs al servidor FTP de Belcorp y se notificará al grupo de destinatarios.',
  regenerar: 'Se regenerará el cargue desde cero para la fecha indicada.',
};

function ConfirmacionCargueContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const operation = params.get('operation') ?? '';
  const action = params.get('action') ?? '';
  const date = params.get('date') ?? '';

  const operationLabel = OPERATION_LABELS[operation];
  const actionLabel = ACTION_LABELS[action];
  const actionDescription = ACTION_DESCRIPTIONS[action];

  if (!operationLabel || !actionLabel || !date) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <p className="text-lg font-semibold">Enlace inválido</p>
          <p className="text-muted-foreground text-sm">
            Los parámetros de esta acción son inválidos o están incompletos.
          </p>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <p className="text-lg font-semibold">Tarea iniciada</p>
          <p className="text-muted-foreground text-sm">
            {actionLabel} para {operationLabel} del {date} fue iniciado correctamente.
          </p>
          <Button variant="outline" onClick={() => router.push('/mygp/facturacion/reportes')}>
            Ir a Facturación
          </Button>
        </Card>
      </div>
    );
  }

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await GPClient.get(`/task-orchestrator/cargue-facturacion/${operation}/${action}`, {
        params: { date },
      });
      setDone(true);
      toast.success('Tarea iniciada correctamente');
    } catch (err: any) {
      toast.error('Error al iniciar la tarea', {
        description: err?.response?.data?.detail ?? err?.message ?? 'Intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-8 max-w-md w-full space-y-6">
        <div className="space-y-1">
          <p className="text-xl font-bold">Confirmar acción</p>
          <p className="text-muted-foreground text-sm">Revisa los detalles antes de continuar.</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Operación</span>
            <span className="font-semibold">{operationLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Acción</span>
            <span className="font-semibold">{actionLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha</span>
            <span className="font-semibold">{date}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">
          {actionDescription}
        </p>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Iniciando...
              </span>
            ) : (
              'Confirmar'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function ConfirmacionCarguePage() {
  return (
    <Suspense>
      <ConfirmacionCargueContent />
    </Suspense>
  );
}
