import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type HoverPopoverProps = {
  text?: string | null;
  className?: string;
  contentClassName?: string;
  maxWidthClass?: string;
  fallback?: string;
  heightClassName?: string;
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
  const closeTimerRef = React.useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleEnter = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 80);
  };

  React.useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  if (!value) {
    return <p className={['text-center', className].join(' ')}>{display}</p>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={['w-full cursor-default flex items-center', heightClassName].join(' ')}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className={[maxWidthClass, 'w-full truncate text-center', className].join(' ')}>
            {display}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className={['max-w-sm break-words', contentClassName].join(' ')}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {value}
      </PopoverContent>
    </Popover>
  );
}
