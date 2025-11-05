import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Generic reusable dialog component with scrollable content and capped height.
 */
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
  trigger?: React.ReactNode; // custom trigger node
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="
          max-w-[80vw] sm:max-w-[900px]  /* override shadcn max-w-lg */
          w-full                          /* fill the allowed width */
          max-h-[80vh]
          overflow-y-auto
        "
      >
        <DialogHeader>
          <DialogTitle>{title || ''}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="w-full ">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
