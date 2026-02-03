import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { IsComplete } from './buttons/IsComplete';
import { ShowFile, ShowFileSlot } from './buttons/ShowFile';
import { FileController } from './form-controllers/FileController';
import { MultiImageController } from './MultiImageController';
import { DownloadFormato } from './DownloadFormato';
import { LinkIcon } from 'lucide-react';

type InputController = {
  form: any;
  fieldLabel: string;
  controllerName: string;
  accept?: string[];
  buttonText?: string;
  docKey: string;
  isMulti?: boolean;
  description?: string;
  showFile?: boolean;
  showFileSlot?: boolean;
  formatoDoc?: string;
};

export function InputController({
  form,
  fieldLabel,
  controllerName,
  accept = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
  buttonText = 'Selecciona .pdf .png .jpeg',
  docKey,
  isMulti = false,
  description = '',
  showFile = true,
  showFileSlot = false,
  formatoDoc,
}: InputController) {
  const { casa_id } = useCliente();
  const gridCols = showFile ? 'grid-cols-[auto_1fr_auto]' : 'grid-cols-[1fr_auto]';
  return (
    <>
      {!isMulti ? (
        <div className={`w-full grid ${gridCols} gap-2 items-end`}>
          {showFileSlot && <ShowFileSlot />}
          <div className="flex flex-col gap-2 items-center">
            {formatoDoc &&
              (formatoDoc !== 'LISTA_CLINTON' ? (
                <DownloadFormato doc={formatoDoc} />
              ) : (
                <LinkIcon
                  size={20}
                  className="cursor-pointer"
                  onClick={() => {
                    window.open(
                      'https://sanctionssearch.ofac.treas.gov/',
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                />
              ))}
            {showFile && <ShowFile client={casa_id} docKey={docKey} />}
          </div>
          <FileController
            form={form}
            fieldLabel={fieldLabel}
            controllerName={controllerName}
            accept={accept}
            buttonText={buttonText}
          />
          <IsComplete docKey={docKey} />
        </div>
      ) : (
        <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-end">
          {showFile && <ShowFile client={casa_id} docKey={docKey} />}
          <MultiImageController
            control={form.control}
            name={controllerName}
            accept={accept}
            label={fieldLabel}
            description={description}
          />
          <IsComplete docKey={docKey} />
        </div>
      )}
    </>
  );
}
