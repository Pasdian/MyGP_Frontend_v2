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
import { Carousel } from '../ui/carousel';
import { PartidasPrevios } from '@/types/dea/PartidasPrevios';
import useSWRImmutable from 'swr/immutable';
import { axiosImageFetcher } from '@/lib/axiosUtils/axios-instance';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function ImageDialog({
  onOpenChange,
  open,
  partidasPrevios,
  previoInfo,
  getImageKey,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  partidasPrevios: PartidasPrevios;
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

  const [imageBlobUrlMap, setImageBlobUrlMap] = React.useState<Map<string, string>>(new Map());

  const { data: curImageUrl, isLoading: isCurImageUrlLoading } = useSWRImmutable(
    currentImageKey,
    axiosImageFetcher
  ); // Current blob url

  React.useEffect(() => {
    if (!curImageUrl) return;

    const filename = partidasPrevios[previoInfo.currentFolder][currentIndex];

    setImageBlobUrlMap((prev) => {
      const newMap = new Map(prev);

      // Revoke old URL if exists
      const oldUrl = newMap.get(filename);
      if (oldUrl && oldUrl !== curImageUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      newMap.set(filename, curImageUrl);
      return newMap;
    });
  }, [curImageUrl, currentIndex, previoInfo.currentFolder, partidasPrevios]);

  React.useEffect(() => {
    return () => {
      imageBlobUrlMap.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageBlobUrlMap]);

  const goNext = () => {
    if (currentIndex < partidasPrevios[previoInfo.currentFolder].length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Carousel>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {previoInfo.currentFolder} - {currentFilename}
            </DialogTitle>
            <DialogDescription>
              Usa la rueda del mouse para hacer zoom.
              <br />
              Puedes arrastrar la imagen en cualquier momento.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden">
            {isCurImageUrlLoading && (
              <div className="flex justify-center">
                <TailwindSpinner />
              </div>
            )}
            {imageBlobUrlMap.has(currentFilename) && (
              <ImageWithPanningCursor
                currentFilename={currentFilename}
                imageBlobUrlMap={imageBlobUrlMap}
                key={currentFilename}
              />
            )}
          </div>

          <div className="flex justify-between">
            <NextPrevButton
              title="Anterior"
              icon={<ChevronLeft />}
              curIndex={currentIndex}
              lastIndex={partidasPrevios[previoInfo.currentFolder].length - 1}
              isCurImageLoading={isCurImageUrlLoading}
              onClickFn={goPrev}
            />
            <NextPrevButton
              title="Siguiente"
              icon={<ChevronRight />}
              curIndex={currentIndex}
              lastIndex={partidasPrevios[previoInfo.currentFolder].length - 1}
              isCurImageLoading={isCurImageUrlLoading}
              onClickFn={goNext}
            />
          </div>
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}

function NextPrevButton({
  title,
  curIndex,
  lastIndex,
  icon,
  isCurImageLoading,
  onClickFn,
}: {
  title: string;
  icon: React.ReactNode;
  curIndex: number;
  lastIndex: number;
  isCurImageLoading: boolean;
  onClickFn: () => void;
}) {
  if (isCurImageLoading) return;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => !isCurImageLoading && onClickFn()}
      className={`mr-2 ${
        (curIndex === 0 && title !== 'Siguiente') ||
        (curIndex === lastIndex && title !== 'Anterior')
          ? 'invisible'
          : ''
      } text-white bg-blue-600 hover:bg-blue-700 hover:text-white cursor-pointer`}
    >
      <div className="flex items-center">
        {title == 'Siguiente' ? (
          <>
            <p>{title}</p>
            {icon}
          </>
        ) : (
          <>
            {icon} <p>{title}</p>
          </>
        )}
      </div>
    </Button>
  );
}

function ImageWithPanningCursor({
  currentFilename,
  imageBlobUrlMap,
}: {
  currentFilename: string;
  imageBlobUrlMap: Map<string, string>;
}) {
  const [isPanning, setIsPanning] = React.useState(false);

  return (
    <>
      {imageBlobUrlMap.has(currentFilename) && (
        <TransformWrapper
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          panning={{ velocityDisabled: true }}
          minScale={1}
          limitToBounds={true}
          centerZoomedOut={true}
          onPanningStart={() => setIsPanning(true)}
          onPanningStop={() => setIsPanning(false)}
        >
          <TransformComponent>
            <div
              style={{
                cursor: isPanning ? 'grabbing' : 'grab',
                display: 'inline-block',
                borderRadius: 8,
              }}
            >
              <Image
                src={imageBlobUrlMap.get(currentFilename)!}
                alt={currentFilename}
                height={700}
                width={700}
                draggable={false}
                style={{ borderRadius: 8, userSelect: 'none' }}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      )}
    </>
  );
}
