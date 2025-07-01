import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export class ErrorTooltip {
  render(value: string, errorMessage: string): React.ReactNode {
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
}
