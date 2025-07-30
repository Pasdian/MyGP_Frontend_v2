import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';
import React from 'react';
import TailwindSpinner from '../ui/TailwindSpinner';

export default function ImageDialog({
  onOpenChange,
  open,
  src,
  alt,
  isImageLoading,
}: {
  onOpenChange: (open: boolean) => void;
  src: string | undefined;
  alt: string;
  open: boolean;
  isImageLoading: boolean;
}) {
  const [isZoomed, setIsZoomed] = React.useState(false);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[900px]">
        <DialogHeader>
          <DialogTitle>{alt}</DialogTitle>
          <DialogDescription>Haz click en la imagen para hacer zoom</DialogDescription>
        </DialogHeader>

        {isImageLoading && <TailwindSpinner />}
        {src && !isImageLoading && (
          <div
            className={`transition-transform duration-300 z-1 cursor-zoom-${
              isZoomed ? 'out' : 'in'
            }`}
            style={{
              transform: isZoomed ? 'scale(2)' : 'scale(1)',
              transformOrigin: 'center center',
              display: 'flex',
              justifyContent: 'center',
            }}
            onClick={() => {
              setIsZoomed((prev) => !prev);
            }}
          >
            <Image
              src={src}
              alt={alt}
              height={700}
              width={700}
              style={{
                borderRadius: 8,
                transition: 'transform 0.3s ease',
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
