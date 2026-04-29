'use client';

import { ArrowLeft, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import TimerButton from './TimerButton';
import type { ViewerLayout } from '@/lib/glosa/types';

type Props = {
  title: string;
  badges: React.ReactNode;
  paused: boolean;
  onToggleTimer: () => void;
  layout: ViewerLayout;
  onLayoutChange: (l: ViewerLayout) => void;
  readOnly: boolean;
  onBack: () => void;
  onRequestChanges?: () => void;
  onAccept?: () => void;
};

const LAYOUTS: { id: ViewerLayout; label: string }[] = [
  { id: 'split',       label: 'Split' },
  { id: 'single',      label: 'Tabs' },
  { id: 'data',        label: '+ Datos' },
  { id: 'errors',      label: '+ Errores' },
  { id: 'validations', label: '+ Validac.' },
];

export default function ViewerToolbar({
  title,
  badges,
  paused,
  onToggleTimer,
  layout,
  onLayoutChange,
  readOnly,
  onBack,
  onRequestChanges,
  onAccept,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E5] bg-white px-3 py-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <div className="text-[10px] uppercase text-[#737373] font-semibold">
            {readOnly ? 'Vista espejo KAM · Sólo lectura' : 'Glosa en proceso'}
          </div>
          <div className="text-sm font-bold truncate">{title}</div>
        </div>
        <div className="flex items-center gap-1 ml-2">{badges}</div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!readOnly && (
          <TimerButton paused={paused} onToggle={onToggleTimer} />
        )}

        {!readOnly && (
          <ToggleGroup
            type="single"
            value={layout}
            onValueChange={(v) => v && onLayoutChange(v as ViewerLayout)}
            className="border border-[#E5E5E5] rounded-md p-0.5"
          >
            {LAYOUTS.map((l) => (
              <ToggleGroupItem
                key={l.id}
                value={l.id}
                className="px-2 py-1 h-7 text-[10px] font-bold data-[state=on]:bg-[#0A0A0A] data-[state=on]:text-white rounded"
              >
                {l.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        {!readOnly ? (
          <>
            <Button
              size="sm"
              onClick={onRequestChanges}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              Solicitar cambios
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Aceptar
            </Button>
          </>
        ) : (
          <Button size="sm">
            <Send className="h-3.5 w-3.5 mr-1" />
            Responder al glosador
          </Button>
        )}
      </div>
    </div>
  );
}
