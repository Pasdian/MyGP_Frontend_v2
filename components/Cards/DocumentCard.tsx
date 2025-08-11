import { Card } from '@/components/ui/card';
import { DownloadIcon, Upload } from 'lucide-react';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import React from 'react';
import { IconUpload } from '@tabler/icons-react';
import UploadFileDialog from '../Dialogs/UploadFileDialog';

export default function DocumentCard({
  title,
  files = [],
  isLoading,
  onDownload,
  onFileSelect,
  activeFile,
  folder,
  filterFn = () => true,
}: {
  title: string;
  files: string[];
  isLoading: boolean;
  onDownload: () => void;
  onFileSelect: (item: string) => void;
  activeFile: string;
  filterFn?: (item: string) => void;
  folder: string;
}) {
  const cardClassName = 'h-[240px] py-0 rounded-md';
  const cardHeaderClassName = 'h-full overflow-y-auto text-xs';
  const stickyClassName =
    'sticky top-0 bg-blue-500 p-2 text-white flex justify-between items-center';

  const [openDialog, setOpenDialog] = React.useState(false);
  return (
    <Card className={cardClassName}>
      <div className={cardHeaderClassName}>
        <div className={stickyClassName}>
          <p className="font-bold">
            {title} - {files.filter(filterFn).length} archivos
          </p>
          <div>
            {files.length > 0 && !isLoading ? (
              <div className="flex">
                <IconUpload
                  size={20}
                  color="white"
                  className="cursor-pointer mr-2"
                  onClick={() => setOpenDialog(true)}
                />
                <DownloadIcon size={20} className="cursor-pointer" onClick={onDownload} />
              </div>
            ) : isLoading ? (
              <TailwindSpinner className="w-6 h-6" />
            ) : null}
          </div>
        </div>
        <div className="p-2 break-words">
          {files.filter(filterFn).map((item) => (
            <p
              key={item}
              className={
                item === activeFile
                  ? 'bg-green-300 cursor-pointer mb-1'
                  : 'cursor-pointer mb-1 even:bg-gray-200'
              }
              onClick={() => onFileSelect(item)}
            >
              {item}
            </p>
          ))}
        </div>
      </div>
      <UploadFileDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title={title}
        folder={folder}
      />
    </Card>
  );
}
