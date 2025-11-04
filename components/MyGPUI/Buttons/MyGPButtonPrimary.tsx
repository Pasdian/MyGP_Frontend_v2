import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Enterprise primary button: solid color, accessible focus ring, subtle motion
export function MyGPButtonPrimary({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      className={cn('bg-blue-500 hover:bg-blue-600 h-full cursor-pointer', className)}
      {...props}
    >
      <span className="font-bold grid grid-cols-[auto_auto] items-center gap-1 truncate">
        {children}
      </span>
    </Button>
  );
}
