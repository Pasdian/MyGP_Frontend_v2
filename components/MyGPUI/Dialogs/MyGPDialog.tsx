import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function MyGPDialog({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
}: {
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent
        className="
          top-[50%] left-0
          flex flex-col justify-start
          h-auto max-h-[100dvh]
          w-screen max-w-none
          translate-x-0 translate-y-[-50%]
          overflow-y-auto
          rounded-none border-0 p-4
          sm:top-[50%] sm:left-[50%]
          sm:grid
          sm:h-auto sm:w-full
          sm:max-h-[80vh] sm:max-w-[900px]
          sm:translate-x-[-50%] sm:translate-y-[-50%]
          sm:rounded-lg sm:border sm:p-6
        "
      >
        <DialogHeader className="text-left">
          <DialogTitle>{title || ''}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="w-full">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
