import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type HoverPopoverProps = {
  text?: string | null;
  className?: string;
  contentClassName?: string;
  maxWidthClass?: string;
  fallback?: string;
  heightClassName?: string; // add
};

export default function HoverPopover({
  text,
  className = '',
  contentClassName = '',
  maxWidthClass = 'max-w-[200px]',
  fallback = '--',
  heightClassName = 'h-14',
}: HoverPopoverProps) {
  const value = text?.trim() ?? '';
  const display = value || fallback;
  const [open, setOpen] = React.useState(false);

  if (!value) {
    return <p className={['text-center', className].join(' ')}>{display}</p>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={['w-full cursor-default flex items-center h-14'].join(' ')}>
          <div className={[maxWidthClass, 'w-full truncate text-center', className].join(' ')}>
            {display}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className={['max-w-sm break-words', contentClassName].join(' ')}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {value}
      </PopoverContent>
    </Popover>
  );
}
