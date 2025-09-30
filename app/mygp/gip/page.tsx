'use client';
import * as React from 'react';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { Button } from '@/components/ui/button';

function joinPath(base: string, seg: string) {
  if (!base) return seg;
  return `${base.replace(/\/+$/, '')}/${seg.replace(/^\/+/, '')}`;
}

function dirname(p: string) {
  if (!p) return '';
  const parts = p.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}

function buildPreviewSrc(relPath: string) {
  // same-origin API
  return `/gip/download?filepath=${encodeURIComponent(relPath)}`;
}

export default function GipBrowser() {
  const [folder, setFolder] = React.useState<string>(''); // current directory
  const [selectedFile, setSelectedFile] = React.useState<string>(''); // file to preview

  const key = `/gip/search${folder ? `?filepath=${encodeURIComponent(folder)}` : ''}`;
  const { data, isLoading, error } = useSWRImmutable(key, axiosFetcher);

  const goInto = (name: string) => {
    setSelectedFile(''); // clear viewer when changing folder
    setFolder(joinPath(folder, name));
  };
  const goUp = () => {
    setSelectedFile('');
    setFolder(dirname(folder));
  };
  const atRoot = folder === '' || folder === '/';

  const openFile = (name: string) => {
    const rel = joinPath(folder, name);
    setSelectedFile(rel);
  };

  return (
    <div className="p-4 space-y-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          className="text-blue-600 hover:underline disabled:text-gray-400"
          onClick={() => {
            setFolder('');
            setSelectedFile('');
          }}
          disabled={atRoot}
        >
          /
        </button>
        {folder
          .split('/')
          .filter(Boolean)
          .map((seg, i, arr) => {
            const pathUpTo = arr.slice(0, i + 1).join('/');
            return (
              <React.Fragment key={pathUpTo}>
                <span>/</span>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setFolder(pathUpTo);
                    setSelectedFile('');
                  }}
                >
                  {seg}
                </button>
              </React.Fragment>
            );
          })}
        <div className="ml-auto flex items-center gap-2">
          {!atRoot && (
            <Button
              className="bg-blue-500 hover:bg-blue-600 cursor-pointer px-2 py-1 rounded border hover:bg-gray-50"
              onClick={goUp}
            >
              Atrás
            </Button>
          )}
          {selectedFile && (
            <button
              className="px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => setSelectedFile('')}
              title="Close viewer"
            >
              Cerrar visor
            </button>
          )}
        </div>
      </div>

      {/* Two-pane layout: left = list, right = viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: listing (unchanged) */}
        <div className="border rounded-md overflow-y-auto max-h-[800px]">
          {isLoading && <div className="p-3 text-gray-500">Loading…</div>}
          {error && <div className="p-3 text-red-600">Failed to load.</div>}

          {Array.isArray(data) && data.length === 0 && (
            <div className="p-3 text-gray-500">This folder is empty.</div>
          )}

          {Array.isArray(data) &&
            data.map((item, index) => {
              const fullRel = joinPath(folder, item.name);
              const isSelected = !item.is_dir && selectedFile === fullRel;

              return (
                <div
                  key={item.name}
                  onClick={() => {
                    if (item.is_dir) {
                      goInto(item.name);
                    } else {
                      openFile(item.name);
                    }
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-blue-400'
                      : index % 2 === 0
                      ? 'bg-gray-50'
                      : 'bg-white'
                  } hover:bg-gray-100`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{item.is_dir ? '📁' : '📄'}</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="border rounded-md min-h-[300px] h-[80vh] overflow-hidden flex flex-col">
          {!selectedFile ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a file to preview
            </div>
          ) : (
            <>
              {/* Viewer header shows current file + actions */}
              <div className="flex items-center gap-3 px-3 py-2 border-b bg-gray-50">
                <span className="text-xs uppercase text-gray-500">Previewing:</span>
                <span className="font-medium truncate" title={selectedFile}>
                  {selectedFile.split('/').pop()}
                </span>
              </div>

              {/* Viewer body */}
              <div className="flex-1 overflow-auto">
                {selectedFile && (
                  <iframe
                    key={selectedFile} // force refresh if same file reselected
                    src={buildPreviewSrc(selectedFile)} // <-- use the /download endpoint
                    className="w-full h-full"
                    title={`Preview ${selectedFile.split('/').pop()}`}
                    frameBorder={0}
                    allow="fullscreen"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
