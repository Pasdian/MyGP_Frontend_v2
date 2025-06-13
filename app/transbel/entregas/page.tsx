import { GPClient } from '@/axios-instance';
import TransbelDeliveries from '@/components/transbel/entregas/TransbelDeliveries';

export default async function Deliveries() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas</h1>
      {/*Transbel Deliveries DataTable*/}
      <TransbelDeliveries />
    </div>
  );
}
