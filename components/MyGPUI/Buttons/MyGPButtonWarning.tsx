import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MyGPButtonWarning({
  className,
  children,
  type = 'button',
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      type={type}
      className={cn('bg-yellow-500 w-[130px] hover:bg-yellow-600 h-full cursor-pointer', className)}
    >
      <span className="font-bold grid grid-cols-[auto_auto] items-center gap-1 truncate">
        {children}
      </span>
    </Button>
  );
}
