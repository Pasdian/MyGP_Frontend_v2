import { TreeView, TreeDataItem } from '@/components/ui/tree-view';
import React from 'react';
import { Folder, Image } from 'lucide-react';
import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { PartidasPrevios } from '@/types/dea/PartidasPrevios';
import TailwindSpinner from '../ui/TailwindSpinner';
import ImageDialog from './ImageDialog';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { IconEye } from '@tabler/icons-react';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';

/** Map reference -> centralizada folder code */
function getCurrentFolderFromReference(reference?: string) {
  if (!reference || reference.length < 2) return '640';
  const char = reference.charAt(1);
  if (['A', 'L', 'T'].includes(char)) return '3901';
  if (['M', 'F'].includes(char)) return '3072';
  return '640';
}

export default function PreviosDialog({ className }: { className?: string }) {
  const { custom, reference } = useDEAStore((state) => state);
  const [open, setOpen] = React.useState(false);
  const [currentFolder, setCurrentFolder] = React.useState('');
  const [openImageDialog, setOpenImageDialog] = React.useState(false);
  const [treeData, setTreeData] = React.useState<TreeDataItem[]>([]);
  const [currentItem, setCurrentItem] = React.useState<string>('');

  // Stable SWR key
  const baseFolder = React.useMemo(
    () => (custom && reference ? getCurrentFolderFromReference(reference) : null),
    [custom, reference]
  );

  const partidasPreviosKey = React.useMemo(() => {
    if (!custom || !reference || !baseFolder) return null;
    return `/dea/scan?source=/centralizada/${baseFolder}/${custom}/Previos/${reference}`;
  }, [custom, reference, baseFolder]);

  const {
    data: partidasPrevios,
    error: partidasPreviosError,
    isLoading: isPartidasPreviosLoading,
  } = useSWR<PartidasPrevios>(partidasPreviosKey, axiosFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  // Build Tree data
  React.useEffect(() => {
    if (!partidasPrevios) {
      setTreeData([]);
      return;
    }

    const entries = Object.entries(partidasPrevios) as [string, string[]][];
    const result: TreeDataItem[] = entries
      .filter(([, items]) => items && items.length > 0)
      .map(([folderKey, items]) => ({
        id: folderKey,
        name: `${folderKey} - ${items.length} archivos`,
        onClick: () => setCurrentFolder(folderKey),
        children: items.map((item) => ({
          id: `${folderKey}/${item}`,
          name: item,
          onClick: () => {
            setCurrentFolder(folderKey);
            setCurrentItem(item);
            setOpenImageDialog(true);
          },
        })),
      }));

    setTreeData(result);
  }, [partidasPrevios]);

  // Reset state when dialog closes or deps change
  React.useEffect(() => {
    if (!open) {
      setCurrentFolder('');
      setCurrentItem('');
      setOpenImageDialog(false);
    }
  }, [open]);

  React.useEffect(() => {
    // if user changes reference/custom while dialog is open, reset selections
    setCurrentFolder('');
    setCurrentItem('');
    setOpenImageDialog(false);
  }, [reference, custom]);

  // Helpers
  const getImageKey = React.useCallback(
    ({
      custom: c,
      reference: r,
      currentFolder: cf,
      imageName,
    }: {
      custom?: string;
      reference?: string;
      currentFolder?: string;
      imageName?: string;
    }) => {
      if (!c || !r || !cf || !imageName) return null; // <— return null, not undefined
      const folder = getCurrentFolderFromReference(r);
      return `/dea/getFileContent?source=/centralizada/${folder}/${c}/Previos/${r}/${cf}/${imageName}`;
    },
    []
  );

  const disabled = !custom || !reference;
  const hasAnyData = !!treeData.length;
  const showNoPreviosInDialog =
    !isPartidasPreviosLoading && !partidasPreviosError && partidasPrevios && !hasAnyData;

  if (!hasAnyData)
    return (
      <MyGPButtonPrimary className={className} disabled>
        No existen previos
      </MyGPButtonPrimary>
    );

  return (
    <>
      <MyGPDialog
        open={open}
        onOpenChange={setOpen}
        title={`Previos${reference ? ` - ${reference}` : ''}`}
        description={`Aquí se listan los previos y las partidas de la referencia ${
          reference ?? '—'
        }`}
        // keep your height & scroll behavior
        trigger={
          <MyGPButtonPrimary
            className={className}
            disabled={disabled}
            title={disabled ? 'Selecciona aduana y referencia' : 'Ver previos'}
          >
            <IconEye />
            <span className="ml-1">Ver Previos</span>
          </MyGPButtonPrimary>
        }
      >
        <div>
          {isPartidasPreviosLoading && <TailwindSpinner className="w-10 h-10" />}

          {partidasPreviosError && (
            <p className="text-sm ml-3 text-red-600">No se pudieron cargar los previos.</p>
          )}

          {!isPartidasPreviosLoading && !partidasPreviosError && !partidasPrevios && (
            <p className="text-sm ml-3">No existen previos.</p>
          )}

          {showNoPreviosInDialog && <p className="text-sm ml-3">No se encontraron datos.</p>}

          {!isPartidasPreviosLoading && !partidasPreviosError && hasAnyData && custom && (
            <TreeView defaultNodeIcon={Folder} defaultLeafIcon={Image} data={treeData} />
          )}
        </div>
      </MyGPDialog>

      {/* Image dialog */}
      {openImageDialog &&
        currentFolder &&
        custom &&
        reference &&
        currentItem &&
        partidasPrevios && (
          <ImageDialog
            key={`${currentFolder}/${currentItem}`}
            open={openImageDialog}
            onOpenChange={setOpenImageDialog}
            partidasPrevios={partidasPrevios}
            getImageKey={getImageKey}
            previoInfo={{ custom, reference, currentFolder, imageName: currentItem }}
          />
        )}
    </>
  );
}
