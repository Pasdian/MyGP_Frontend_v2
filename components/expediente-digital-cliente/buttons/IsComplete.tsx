import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { CircleCheck } from 'lucide-react';

export function IsComplete({ docKey }: { docKey: string }) {
  const { progressMap } = useCliente();

  return <div>{progressMap[docKey] == 100 && <CircleCheck className="text-green-400" />}</div>;
}
