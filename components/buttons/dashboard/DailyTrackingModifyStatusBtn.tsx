'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import React from 'react';
import { Row } from '@tanstack/react-table';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconBallpenFilled } from '@tabler/icons-react';
import ModifyDailyTrackingStatus from '@/components/forms/dashboard/ModifyDailyTrackingStatus';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';
import { DailyTrackingFormatted } from '@/types/dashboard/tracking/dailyTracking';
import { useOperationHistory } from '@/hooks/useOperationHistory';
import { OperationHistory } from '@/types/dashboard/tracking/operationHistory';
import { v4 as uuidv4 } from 'uuid';

const TAB_VALUES = ['history', 'modify_status'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

export default function DailyTrackingModifyStatusBtn({
  row,
}: {
  row: Row<DailyTrackingFormatted>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState('modify_status');
  const { history, loading: isHistoryLoading } = useOperationHistory(
    (isOpen && row.original.NUM_REFE) || ''
  ); // Fetch only when isOpen

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-yellow-400 hover:bg-yellow-500">
          <IconBallpenFilled />
          Modificar
        </Button>
      </DialogTrigger>

      <DialogContent className="md:max-w-[900px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tabValue == 'history'
              ? `Historial - ${row.original.NUM_REFE}`
              : `Editar Estatus - ${row.original.NUM_REFE}`}
          </DialogTitle>
          <DialogDescription>
            {tabValue == 'history'
              ? 'Aquí se visualiza el historial de la referencia'
              : 'Aquí podrás realizar la modificación de un estatus. Haz click en guardar cuando termines de editar los campos.'}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={tabValue}
          onValueChange={(v) => isTabValue(v) && setTabValue(v)}
          className="mr-2"
        >
          <TabsList>
            <TabsTrigger value="modify_status">Modificar Estatus</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="h-full overflow-y-scroll">
          {isOpen && history && tabValue === 'history' && !isHistoryLoading && (
            <OperationHistoryTable history={history} />
          )}

          {tabValue == 'modify_status' && isOpen && row && (
            <ModifyDailyTrackingStatus row={row} setOpenDialog={setIsOpen} />
          )}
        </div>
        {isOpen && tabValue == 'history' && isHistoryLoading && <TailwindSpinner className="w-8" />}
      </DialogContent>
    </Dialog>
  );
}

function OperationHistoryTable({ history }: { history: OperationHistory[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 8px',
                borderBottom: '1px solid #ddd',
              }}
            >
              REFERENCIA
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 8px',
                borderBottom: '1px solid #ddd',
              }}
            >
              ESTATUS VIEJO
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 8px',
                borderBottom: '1px solid #ddd',
              }}
            >
              NUEVO ESTATUS
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 8px',
                borderBottom: '1px solid #ddd',
              }}
            >
              MODIFICADO EN
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 8px',
                borderBottom: '1px solid #ddd',
              }}
            >
              MODIFICADO POR
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((op) => {
            const referencia = op.REFERENCIA;
            const oldStatus = op.OLD_STATUS;
            const newStatus = op.NEW_STATUS;
            const changedBy = op.CHANGED_BY;
            const changedAt = getFormattedDate(op.CHANGED_AT);
            const key = uuidv4();

            return (
              <tr key={key}>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>{referencia}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>{oldStatus}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>{newStatus}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>{changedAt}</td>
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>{changedBy}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
