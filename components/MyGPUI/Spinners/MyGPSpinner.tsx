import { Loader2Icon } from 'lucide-react';

export default function MyGPSpinner() {
  return (
    <div className="flex w-full h-full items-center justify-center text-gray-400">
      <Loader2Icon className="animate-spin" />
    </div>
  );
}
