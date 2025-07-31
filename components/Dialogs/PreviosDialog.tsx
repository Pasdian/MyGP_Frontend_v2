import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { TreeView, TreeDataItem } from '@/components/ui/tree-view';

import React from 'react';
import { Folder, Image } from 'lucide-react';
import useSWRImmutable from 'swr/immutable';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { PartidasPrevios } from '@/types/dea/PartidasPrevios';
import TailwindSpinner from '../ui/TailwindSpinner';
import ImageDialog from './ImageDialog';
import { useDEAStore } from '@/app/providers/dea-store-provider';

function getFolder(custom: string) {
  const char = custom.charAt(1);

  if (['A', 'L', 'T'].includes(char)) {
    return '3901';
  }

  if (['M', 'F'].includes(char)) {
    return '3072';
  }

  return '640';
}

export default function PreviosDialog() {
  const { custom, reference } = useDEAStore((state) => state);

  const [folder, setFolder] = React.useState('');
  const [openImageDialog, setOpenImageDialog] = React.useState(false);
  const [TreeData, setTreeData] = React.useState<TreeDataItem[]>([]);
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>('');

  const previoImageKey =
    custom &&
    reference &&
    folder &&
    selectedItemId &&
    `/dea/centralizada/${getFolder(
      reference
    )}/${custom}/Previos/${reference}/${folder}/${selectedItemId}`;

  const partidasPreviosKey =
    custom &&
    reference &&
    `/dea/centralizada/${getFolder(reference)}/${custom}/Previos/${reference}`;

  const { data: PartidasPreviosData, isLoading: isPartidosPreviosLoading } =
    useSWRImmutable<PartidasPrevios>(partidasPreviosKey, axiosFetcher);

  const { data: previoImage, isLoading: isPrevioImageLoading } = useSWRImmutable(
    previoImageKey,
    axiosBlobFetcher
  );

  React.useEffect(() => {
    if (!PartidasPreviosData) return;
    const result = Object.entries(PartidasPreviosData)
      .filter(([, items]) => items.length > 0) // Exclude empty arrays
      .map(([folderKey, items]) => ({
        id: folderKey,
        name: folderKey,
        children: items.map((item) => ({
          id: item,
          name: item,
          onClick: () => {
            setOpenImageDialog(true);
            setFolder(folderKey);
            setSelectedItemId(item);
          },
        })),
      }));

    setTreeData(result);
  }, [PartidasPreviosData]);

  React.useEffect(() => {
    if (previoImage) {
      const url = URL.createObjectURL(previoImage);
      setImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [previoImage]);
  if (!PartidasPreviosData)
    return (
      <Button disabled className="bg-blue-500 hover:bg-blue-600 font-bold">
        No existen previos
      </Button>
    );

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600 font-bold">Ver Previos</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[800px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previos - {reference}</DialogTitle>
            <DialogDescription>
              Aquí se listan los previos y las partidas de la referencia {reference}
            </DialogDescription>
          </DialogHeader>
          <div>
            {isPartidosPreviosLoading && <TailwindSpinner className="w-10 h-10" />}
            {TreeData.length == 0 && !isPartidosPreviosLoading && (
              <p className="text-sm ml-3">No se encontraron datos.</p>
            )}
            {custom && !isPartidosPreviosLoading && (
              <TreeView defaultNodeIcon={Folder} defaultLeafIcon={Image} data={TreeData} />
            )}
          </div>
        </DialogContent>
        <ImageDialog
          onOpenChange={(val) => {
            setOpenImageDialog(val);
          }}
          src={imageUrl}
          alt={selectedItemId || 'image'}
          open={openImageDialog}
          isImageLoading={isPrevioImageLoading}
        />
      </Dialog>
    </>
  );
}
