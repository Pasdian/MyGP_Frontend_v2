'use client';

import React from 'react';
import { Row } from '@tanstack/react-table';
import { IconBallpenFilled } from '@tabler/icons-react';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { useOperationHistory } from '@/hooks/useOperationHistory';
import { OperationHistory } from '@/types/dashboard/tracking/operationHistory';
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
        className="mb-4 w-full"
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
    <div className="text-xs">
      {/* remove inline-block; let it be full width */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left">
            <th className="px-2 py-1 border-b whitespace-nowrap">REFERENCIA</th>
            <th className="px-2 py-1 border-b whitespace-nowrap">ESTATUS VIEJO</th>
            <th className="px-2 py-1 border-b whitespace-nowrap">NUEVO ESTATUS</th>
            <th className="px-2 py-1 border-b whitespace-nowrap">MODIFICADO EN</th>
            <th className="px-2 py-1 border-b whitespace-nowrap">MODIFICADO POR</th>
          </tr>
        </thead>
        <tbody>
          {history.map((op) => {
            const key = `${op.REFERENCIA}-${op.CHANGED_AT}`;
            return (
              <tr key={key}>
                <td className="px-2 py-1 border-b whitespace-nowrap">{op.REFERENCIA}</td>
                <td className="px-2 py-1 border-b whitespace-nowrap">{op.OLD_STATUS}</td>
                <td className="px-2 py-1 border-b whitespace-nowrap">{op.NEW_STATUS}</td>
                <td className="px-2 py-1 border-b whitespace-nowrap">
                  {formatISOtoDDMMYYYY(op.CHANGED_AT)}
                </td>
                <td className="px-2 py-1 border-b whitespace-nowrap">{op.CHANGED_BY}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
