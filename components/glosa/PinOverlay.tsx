'use client';

import { File } from 'lucide-react';
import FakePage from './FakePage';
import type { GlosaError } from '@/lib/glosa/types';

type FileEntry = { key: string; name: string; label: string };

type Props = {
  files: FileEntry[];
  activeFileKey: string;
  onFileChange: (key: string) => void;
  pins: GlosaError[];
  activePinId: number | null;
  readOnly: boolean;
  accent?: string;
  onClickEmpty: (pos: { x: number; y: number }, fileKey: string) => void;
  onClickPin: (pin: GlosaError) => void;
};

export default function PinOverlay({
  files,
  activeFileKey,
  onFileChange,
  pins,
  activePinId,
  readOnly,
  accent = '#3B82F6',
  onClickEmpty,
  onClickPin,
}: Props) {
  const activeFile = files.find((f) => f.key === activeFileKey) ?? files[0];
  const filePins = pins.filter((p) => p.file === activeFile?.name);

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* File tabs strip */}
      <div className="flex items-center gap-0.5 bg-[#FAFAFA] border-b border-[#E5E5E5] px-2 overflow-x-auto shrink-0">
        {files.map((f) => (
          <button
            key={f.key}
            onClick={() => onFileChange(f.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-[11px] font-semibold border-b-2 transition-colors ${
              activeFileKey === f.key
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#737373] hover:text-[#0A0A0A]'
            }`}
            style={activeFileKey === f.key ? { borderBottomColor: accent } : undefined}
            type="button"
          >
            <File className="h-3 w-3" />
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Document area */}
      <div className="flex-1 min-h-0">
        <FakePage
          title={`${activeFile?.label?.toUpperCase() ?? ''} · ${activeFile?.name ?? ''}`}
          accent={accent}
          pins={filePins}
          activePinId={activePinId}
          readOnly={readOnly}
          onClickEmpty={(pos) => onClickEmpty(pos, activeFileKey)}
          onClickPin={onClickPin}
        />
      </div>
    </div>
  );
}
