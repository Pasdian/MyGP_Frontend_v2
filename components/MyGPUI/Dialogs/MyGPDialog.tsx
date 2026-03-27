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
          top-0 left-0
          h-[100dvh] max-h-[100dvh]
          w-screen max-w-none
          translate-x-0 translate-y-0
          overflow-y-auto
          rounded-none border-0 p-4
          sm:top-[50%] sm:left-[50%]
          sm:h-auto sm:w-full
          sm:max-h-[80vh] sm:max-w-[900px]
          sm:translate-x-[-50%] sm:translate-y-[-50%]
          sm:rounded-lg sm:border sm:p-6
        "
      >
        <DialogHeader>
          <DialogTitle>{title || ''}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="w-full">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
