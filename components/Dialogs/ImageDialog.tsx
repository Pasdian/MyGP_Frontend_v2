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
import { PartidasPrevios } from '@/types/dea/PartidasPrevios';
import useSWR from 'swr';
import { axiosImageFetcher } from '@/lib/axiosUtils/axios-instance';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';

type FolderKey = 'PARTIDAS' | 'PREVIO';

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
  getImageKey: (args: {
    custom: string;
    reference: string;
    currentFolder: FolderKey | string;
    imageName: string;
  }) => string | null | undefined;
  previoInfo: {
    custom: string;
    reference: string;
    currentFolder: FolderKey | string;
    imageName: string;
  };
}) {
  const files = React.useMemo(
    () => partidasPrevios?.[previoInfo.currentFolder as keyof PartidasPrevios] ?? [],
    [partidasPrevios, previoInfo.currentFolder]
  );

  const [currentIndex, setCurrentIndex] = React.useState(() =>
    Math.max(0, files.indexOf(previoInfo.imageName))
  );
  React.useEffect(() => {
    const idx = files.indexOf(previoInfo.imageName);
    setCurrentIndex(Math.max(0, idx === -1 ? 0 : idx));
  }, [files, previoInfo.imageName]);

  const currentFilename = files[currentIndex];
  const currentImageKey = React.useMemo(() => {
    if (!currentFilename) return null;
    return (
      getImageKey({
        ...previoInfo,
        imageName: currentFilename,
      }) ?? null
    );
  }, [getImageKey, previoInfo, currentFilename]);

  // cache only the current image
  const [imageBlobUrlMap, setImageBlobUrlMap] = React.useState<Map<string, string>>(new Map());

  const { data: curImageUrl, isLoading: isCurImageUrlLoading } = useSWR(
    currentImageKey,
    axiosImageFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 0,
      shouldRetryOnError: false,
    }
  );

  React.useEffect(() => {
    if (!curImageUrl || !currentFilename) return;
    setImageBlobUrlMap((prev) => {
      const next = new Map(prev);
      const old = next.get(currentFilename);
      if (old && old !== curImageUrl) URL.revokeObjectURL(old);
      next.set(currentFilename, curImageUrl);
      return next;
    });
  }, [curImageUrl, currentFilename]);

  const lastIndex = Math.max(0, files.length - 1);
  const goNext = React.useCallback(() => {
    setCurrentIndex((i) => (i < lastIndex ? i + 1 : i));
  }, [lastIndex]);
  const goPrev = React.useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, goNext, goPrev]);

  return (
    <MyGPDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${previoInfo.currentFolder}${currentFilename ? ` – ${currentFilename}` : ''}`}
      description="Usa la rueda del mouse o pellizca para hacer zoom. Arrastra para mover la imagen."
    >
      {/* Viewer */}
      <div className="flex-1 grid place-items-center overflow-hidden">
        {isCurImageUrlLoading || !currentFilename ? (
          <div className="flex justify-center">
            <TailwindSpinner />
          </div>
        ) : imageBlobUrlMap.has(currentFilename) ? (
          <ImageWithPanningCursor
            currentFilename={currentFilename}
            imageBlobUrlMap={imageBlobUrlMap}
          />
        ) : (
          <p className="text-xs text-muted-foreground">No se pudo cargar la imagen.</p>
        )}
      </div>

      {/* Nav buttons */}
      <div className="mt-3 flex justify-between">
        <NextPrevButton
          title="Anterior"
          icon={<ChevronLeft />}
          curIndex={currentIndex}
          lastIndex={lastIndex}
          isCurImageLoading={!!isCurImageUrlLoading}
          onClickFn={goPrev}
        />
        <NextPrevButton
          title="Siguiente"
          icon={<ChevronRight />}
          curIndex={currentIndex}
          lastIndex={lastIndex}
          isCurImageLoading={!!isCurImageUrlLoading}
          onClickFn={goNext}
        />
      </div>
    </MyGPDialog>
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
  if (isCurImageLoading) return null;
  const isFirst = curIndex === 0;
  const isLast = curIndex === lastIndex;
  const hide = (isFirst && title !== 'Siguiente') || (isLast && title !== 'Anterior');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => !isCurImageLoading && onClickFn()}
      className={`mr-2 ${
        hide ? 'invisible' : ''
      } text-white bg-blue-600 hover:bg-blue-700 hover:text-white cursor-pointer`}
    >
      <div className="flex items-center gap-1">
        {title === 'Siguiente' ? (
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
          limitToBounds
          centerZoomedOut
          onPanningStart={() => setIsPanning(true)}
          onPanningStop={() => setIsPanning(false)}
        >
          <TransformComponent>
            <div
              style={{
                position: 'relative',
                cursor: isPanning ? 'grabbing' : 'grab',
                borderRadius: 8,
                overflow: 'hidden',
                width: 500, // fixed width in pixels
                height: 500, // fixed height in pixels
                margin: '0 auto', // center the image
                backgroundColor: '#f9f9f9', // optional background for contrast
              }}
            >
              <Image
                src={imageBlobUrlMap.get(currentFilename)!}
                alt={currentFilename}
                fill
                draggable={false}
                style={{
                  borderRadius: 8,
                  userSelect: 'none',
                  objectFit: 'contain',
                }}
                sizes="900px"
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      )}
    </>
  );
}
