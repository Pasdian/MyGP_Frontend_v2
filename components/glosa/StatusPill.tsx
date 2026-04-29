import { Badge } from '@/components/ui/badge';
import type { GlosaStatus } from '@/lib/glosa/types';

type Props = {
  status: GlosaStatus;
};

const STATUS_MAP: Record<
  GlosaStatus,
  { variant: 'outline' | 'default' | 'secondary'; dot: string; label: string }
> = {
  'En proceso':           { variant: 'outline', dot: '#3B82F6', label: 'En proceso' },
  'En pausa':             { variant: 'outline', dot: '#737373', label: 'En pausa' },
  'En espera de cambios': { variant: 'outline', dot: '#EAB308', label: 'En espera de cambios' },
  'Aceptada':             { variant: 'outline', dot: '#22C55E', label: 'Aceptada' },
  'Cerrada':              { variant: 'secondary', dot: '#0A0A0A', label: 'Cerrada' },
  'Nueva':                { variant: 'outline', dot: '#8B5CF6', label: 'Nueva' },
};

export default function StatusPill({ status }: Props) {
  const m = STATUS_MAP[status] ?? STATUS_MAP['En proceso'];
  return (
    <Badge variant={m.variant} className="gap-1">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: m.dot }}
      />
      {m.label}
    </Badge>
  );
}
