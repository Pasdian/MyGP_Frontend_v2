'use client';

import React from 'react';
import { Row } from '@tanstack/react-table';
import { IconBallpenFilled } from '@tabler/icons-react';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { useOperationHistory } from '@/hooks/useOperationHistory';
import { OperationHistory } from '@/types/dashboard/tracking/operationHistory';
import { v4 as uuidv4 } from 'uuid';
import { MyGPTabs } from '@/components/MyGPUI/Tabs/MyGPTabs';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';
import ModifyDailyTrackingStatusForm from '@/components/forms/dashboard/ModifyDailyTrackingStatus';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';

const TAB_VALUES = ['history', 'modify_status'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

export default function DailyTrackingModifyStatusBtn({ row }: { row: Row<DailyTracking> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState('modify_status');
  const { history, loading: isHistoryLoading } = useOperationHistory(
    (isOpen && row.original.NUM_REFE) || ''
  ); // Fetch only when isOpen

  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={
        tabValue === 'history'
          ? `Historial - ${row.original.NUM_REFE}`
          : `Editar Estatus - ${row.original.NUM_REFE}`
      }
      description={
        tabValue === 'history'
          ? 'Aquí se visualiza el historial de la referencia'
          : 'Aquí podrás realizar la modificación de un estatus. Haz click en guardar cuando termines de editar los campos.'
      }
      trigger={
        <MyGPButtonWarning>
          <IconBallpenFilled />
          Modificar
        </MyGPButtonWarning>
      }
    >
      <MyGPTabs
        defaultValue="all"
        tabs={[
          { value: 'modify_status', label: 'Modificar Estatus' },
          { value: 'history', label: 'Historial' },
        ]}
        value={tabValue}
        onValueChange={(v) => isTabValue(v) && setTabValue(v)}
        className="mb-4"
      />

      <div>
        {isOpen && history && tabValue === 'history' && !isHistoryLoading && (
          <OperationHistoryTable history={history} />
        )}

        {tabValue === 'modify_status' && isOpen && row && (
          <ModifyDailyTrackingStatusForm row={row} setOpenDialog={setIsOpen} />
        )}
      </div>

      {isOpen && tabValue === 'history' && isHistoryLoading && <MyGPSpinner />}
    </MyGPDialog>
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
            const changedAt = formatISOtoDDMMYYYY(op.CHANGED_AT);
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
