export const dynamic = 'force-dynamic';

import DeliveriesClient from '@/components/transbel/entregas/DeliveriesClient';

export default async function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas</h1>
      <DeliveriesClient />
    </div>
  );
}
