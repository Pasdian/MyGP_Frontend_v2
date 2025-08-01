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
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { PartidasPrevios } from '@/types/dea/PartidasPrevios';
import useSWRImmutable from 'swr/immutable';
import { axiosImageFetcher } from '@/lib/axiosUtils/axios-instance';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageDialog({
  onOpenChange,
  open,
  isImageLoading,
  partidasPrevios,
  previoInfo,
  getImageKey,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  partidasPrevios: PartidasPrevios;
  isImageLoading: boolean;
  getImageKey: ({
    custom,
    reference,
    currentFolder,
    imageName,
  }: {
    custom: string;
    reference: string;
    currentFolder: 'PARTIDAS' | 'PREVIO';
    imageName: string;
  }) => string | undefined;
  previoInfo: {
    custom: string;
    imageBlobUrl: string | undefined;
    reference: string;
    currentFolder: 'PARTIDAS' | 'PREVIO';
    imageName: string;
  };
}) {
  const [currentIndex, setCurrentIndex] = React.useState(
    partidasPrevios[previoInfo.currentFolder].indexOf(previoInfo.imageName)
  );
  const currentFilename = partidasPrevios[previoInfo.currentFolder][currentIndex];
  const currentImageKey = getImageKey({ ...previoInfo, imageName: currentFilename });
  const [imageBlobUrlArray, setImageBlobUrlArray] = React.useState<(string | undefined)[]>(() => {
    const arr = Array(partidasPrevios[previoInfo.currentFolder].length).fill(undefined);
    arr[currentIndex] = previoInfo.imageBlobUrl;
    return arr;
  }); // Allocate an undefined array of size partidasPrevios
  const { data: curImageUrl } = useSWRImmutable(currentImageKey, axiosImageFetcher);

  const [isZoomed, setIsZoomed] = React.useState(false);
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!curImageUrl) return;

    // Set blob in right position
    setImageBlobUrlArray((prev) => {
      const newArray = [...prev];
      newArray[currentIndex] = curImageUrl;
      return newArray;
    });
  }, [curImageUrl, currentIndex]);

  const goNext = () => {
    if (currentIndex < partidasPrevios[previoInfo.currentFolder].length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Carousel>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{previoInfo.imageName}</DialogTitle>
            <DialogDescription>Haz click en la imagen para hacer zoom</DialogDescription>
          </DialogHeader>
          {isImageLoading && <TailwindSpinner />}
          {!isImageLoading && (
            <>
              <CarouselContent>
                {imageBlobUrlArray.map((blobUrl, i) => {
                  return (
                    <CarouselItem key={i}>
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
                        onClick={() => setIsZoomed((prev) => !prev)}
                      >
                        {curImageUrl && (
                          <Image
                            src={curImageUrl}
                            alt={'image.jpg'}
                            height={700}
                            width={700}
                            style={{
                              borderRadius: 8,
                              transition: 'transform 0.3s ease',
                            }}
                          />
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={goPrev} className="mr-2">
                  <ChevronLeft /> Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={goNext}>
                  <ChevronRight /> Siguiente
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}
