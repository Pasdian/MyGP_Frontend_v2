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
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { PartidasPrevios } from '@/types/dea/PartidasPrevios';
import TailwindSpinner from '../ui/TailwindSpinner';
import ImageDialog from './ImageDialog';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { IconEye } from '@tabler/icons-react';

function getcurrentFolder(custom: string) {
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

  const [currentFolder, setCurrentFolder] = React.useState<'PARTIDAS' | 'PREVIO' | ''>('');
  const [openImageDialog, setOpenImageDialog] = React.useState(false);
  const [TreeData, setTreeData] = React.useState<TreeDataItem[]>([]);
  const [currentItem, setCurrentItem] = React.useState<string | undefined>('');

  const getImageKey = ({
    custom,
    reference,
    currentFolder,
    imageName,
  }: {
    custom?: string;
    reference?: string;
    currentFolder?: string;
    imageName?: string;
  }) => {
    return (
      custom &&
      reference &&
      currentFolder &&
      imageName &&
      `/dea/centralizada/${getcurrentFolder(
        reference
      )}/${custom}/Previos/${reference}/${currentFolder}/${imageName}`
    );
  };

  const partidasPreviosKey =
    custom &&
    reference &&
    `/dea/centralizada/${getcurrentFolder(reference)}/${custom}/Previos/${reference}`;

  const { data: partidasPrevios, isLoading: isPartidosPreviosLoading } =
    useSWRImmutable<PartidasPrevios>(partidasPreviosKey, axiosFetcher);

  React.useEffect(() => {
    if (!partidasPrevios) return;

    const entries = Object.entries(partidasPrevios) as [keyof PartidasPrevios, string[]][];

    const result = entries
      .filter(([, items]) => items.length > 0)
      .map(([currentFolderKey, items]) => ({
        id: currentFolderKey,
        name: `${currentFolderKey} - ${partidasPrevios[currentFolderKey].length}`,
        onClick: () => {
          setCurrentFolder(currentFolderKey);
        },
        children: items.map((item) => ({
          id: item,
          name: item,
          onClick: () => {
            setOpenImageDialog(true);
            setCurrentItem(item);
          },
        })),
      }));

    setTreeData(result);
  }, [partidasPrevios]);

  if (isPartidosPreviosLoading) return;

  if (!partidasPrevios)
    return (
      <Button disabled className="bg-blue-500 hover:bg-blue-600 font-bold">
        No existen previos
      </Button>
    );

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600 font-bold">
            <IconEye />
            Ver Previos
          </Button>
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
      </Dialog>
      {currentFolder && custom && reference && currentFolder && currentItem && (
        <ImageDialog
          onOpenChange={(val) => {
            setOpenImageDialog(val);
          }}
          key={currentItem}
          partidasPrevios={partidasPrevios}
          open={openImageDialog}
          getImageKey={getImageKey}
          previoInfo={{
            custom,
            reference,
            currentFolder,
            imageName: currentItem,
          }}
        />
      )}
    </>
  );
}
