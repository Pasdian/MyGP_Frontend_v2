import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { customs } from '@/lib/customs/customs';
import { TreeView, TreeDataItem } from '@/components/ui/tree-view';

import React from 'react';
import { Folder, Image } from 'lucide-react';
import useSWRImmutable from 'swr/immutable';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { PartidasPrevios } from '@/types/dea/PartidasPrevios';
import { mutate } from 'swr';
import TailwindSpinner from '../ui/TailwindSpinner';
import ImageDialog from './ImageDialog';
import { useDEAStore } from '@/app/providers/dea-store-provider';

export default function PreviosDialog({ reference }: { reference: string }) {
  const { custom, setCustom } = useDEAStore((state) => state);
  const [folder, setFolder] = React.useState('');
  const [openImageDialog, setOpenImageDialog] = React.useState(false);
  const [TreeData, setTreeData] = React.useState<TreeDataItem[]>([]);
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>('');

  const previoImageKey =
    custom && reference && folder && selectedItemId
      ? `/dea/centralizada/3901/${custom}/Previos/${reference}/${folder}/${selectedItemId}`
      : null;

  const partidasPreviosKey =
    custom && reference && `/dea/centralizada/3901/${custom}/Previos/${reference}`;

  const { data: PartidasPreviosData, isLoading } = useSWRImmutable<PartidasPrevios>(
    partidasPreviosKey,
    axiosFetcher
  );

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
  }, [PartidasPreviosData, custom, reference]);

  React.useEffect(() => {
    if (previoImage) {
      const url = URL.createObjectURL(previoImage);
      setImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [previoImage]);

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
            {customs && (
              <CustomsSelect
                customs={customs}
                onChange={(val) => {
                  setCustom(val);
                  setTreeData([]);
                  mutate(partidasPreviosKey);
                }}
              />
            )}
          </div>
          <div>
            {isLoading && <TailwindSpinner className="w-10 h-10" />}
            {TreeData.length == 0 && !isLoading && (
              <p className="text-sm ml-3">No se encontraron datos.</p>
            )}
            {custom && !isLoading && (
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

function CustomsSelect({
  customs,
  onChange,
}: {
  customs: { name: string; key: number }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecciona una aduana" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Aduanas</SelectLabel>
          {customs.map(({ name, key }) => (
            <SelectItem key={key} value={key.toString()}>
              {name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
