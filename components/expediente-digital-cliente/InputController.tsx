import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { IsComplete } from './buttons/IsComplete';
import { ShowFile } from './buttons/ShowFile';
import { FileController } from './form-controllers/FileController';
import { MultiImageController } from './MultiImageController';
import { DownloadFormato } from './DownloadFormato';
import { LinkIcon } from 'lucide-react';

type InputControllerProps = {
  form: any;
  fieldLabel: string;
  controllerName: string;
  accept?: string[];
  buttonText?: string;
  docKey: string;
  isMulti?: boolean;
  description?: string;
  showFile?: boolean;
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
  formatoDoc,
}: InputControllerProps) {
  const { casa_id } = useCliente();

  const showMiddle = Boolean(formatoDoc) || showFile;

  const gridCols = showMiddle ? 'grid-cols-[auto_1fr_auto]' : 'grid-cols-[1fr_auto]';

  return (
    <>
      {!isMulti ? (
        <div className={`w-full grid ${gridCols} gap-2 items-end`}>
          {showMiddle && (
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

              {showFile && (
                <ShowFile
                  client={casa_id}
                  docKey={docKey}
                  disabled={!showFile}
                  className={!showFile ? 'opacity-50' : undefined}
                />
              )}
            </div>
          )}

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
          <ShowFile
            client={casa_id}
            docKey={docKey}
            disabled={!showFile}
            className={!showFile ? 'opacity-50' : undefined}
          />

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
