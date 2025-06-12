import GPLayout from '@/components/gp-layout';
import TransbelClientInterface from '@/components/transbel/interfaz/TransbelClientInterface';

export default async function Interfaz() {
  return (
    <GPLayout>
      {/* Transbel Client Component */}
      <TransbelClientInterface />
    </GPLayout>
  );
}
