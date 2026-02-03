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
          max-w-[80vw] sm:max-w-[900px]
          w-full
          max-h-[80vh]
          overflow-y-auto
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
