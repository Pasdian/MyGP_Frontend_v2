'use client';

import { MyGPTabs } from '@/components/MyGPUI/Tabs/MyGPTabs';
import { useCargue } from '@/hooks/useCargue/useCargue';

export function CarguesTabs() {
  const { tabValue, setTabValue, isTabValue } = useCargue();

  return (
    <div className="flex items-center mb-4 w-[280px]">
      <MyGPTabs
        value={tabValue}
        onValueChange={(v) => isTabValue(v) && setTabValue(v)}
        defaultValue="pending"
        className="mr-2"
        tabs={[
          { value: 'pending', label: 'Pendientes por Enviar' },
          { value: 'paid', label: 'Enviados' },
        ]}
      />
    </div>
  );
}
