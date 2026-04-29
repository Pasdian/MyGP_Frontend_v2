'use client';

import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  paused: boolean;
  onToggle: () => void;
  initialSeconds?: number;
};

export default function TimerButton({ paused, onToggle, initialSeconds = 84 * 60 }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const fmt = `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`gap-2 font-mono ${
        paused
          ? 'border-[#E5E5E5] bg-[#FAFAFA] text-[#737373]'
          : 'border-[#3B82F6] bg-blue-50 text-[#3B82F6]'
      }`}
    >
      {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
      <span className="font-bold">{fmt}</span>
      <span className="text-[10px]">{paused ? 'En pausa' : 'Activo'}</span>
    </Button>
  );
}
