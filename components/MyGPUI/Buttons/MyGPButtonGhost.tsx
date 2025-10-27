import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Enterprise primary button: solid color, accessible focus ring, subtle motion
export function MyGPButtonGhost({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      type="button"
      variant="outline"
      className={cn('w-[130px] h-full cursor-pointer', className)}
    >
      <span className="font-bold grid grid-cols-[auto_auto] items-center gap-1 truncate">
        {children}
      </span>
    </Button>
  );
}
