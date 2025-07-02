import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ErrorTooltip({
  value,
  errorMessage,
}: {
  value: string;
  errorMessage: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="text-center bg-red-400">{value}</p>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-center">{errorMessage}</p>
      </TooltipContent>
    </Tooltip>
  );
}
