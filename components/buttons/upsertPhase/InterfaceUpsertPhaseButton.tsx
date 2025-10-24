'use client';

import React from 'react';
import { Row } from '@tanstack/react-table';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { IconBallpenFilled } from '@tabler/icons-react';
import InterfaceUpsertPhaseForm from '@/components/forms/transbel/interface/InterfaceUpsertPhaseForm';
import InterfaceUpdateFolioForm from '@/components/forms/transbel/interface/InterfaceUpdateFolioForm';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';
import { MyGPTabs } from '@/components/MyGPUI/Tabs/MyGPTabs';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
const TAB_VALUES = ['phase', 'folio'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

export default function InterfaceUpsertPhaseButton({ row }: { row: Row<getRefsPendingCE> }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [tabValue, setTabValue] = React.useState<'phase' | 'folio'>('phase');
  return (
    <MyGPDialog
      open={openDialog}
      onOpenChange={setOpenDialog}
      trigger={
        <MyGPButtonWarning>
          <IconBallpenFilled />
          <span>Modificar</span>
        </MyGPButtonWarning>
      }
    >
      {/* Tabs inside dialog header area */}
      <MyGPTabs
        value={tabValue}
        onValueChange={(v) => isTabValue(v) && setTabValue(v)}
        defaultValue="phase"
        tabs={[
          { value: 'phase', label: 'Modificar Referencia' },
          { value: 'folio', label: 'Modificar Folio' },
        ]}
      />

      {/* Dynamic content */}
      {openDialog && row && tabValue !== 'folio' && (
        <InterfaceUpsertPhaseForm row={row} setOpenDialog={setOpenDialog} />
      )}

      {openDialog && row && tabValue === 'folio' && row.original.REFERENCIA && (
        <InterfaceUpdateFolioForm row={row} setOpenDialog={setOpenDialog} />
      )}
    </MyGPDialog>
  );
}
