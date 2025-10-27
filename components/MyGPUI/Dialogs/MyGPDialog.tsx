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

      <DialogContent className="sm:max-w-md max-h-[80vh] max-w-[80vw] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{title || ''}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="w-full min-w-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
