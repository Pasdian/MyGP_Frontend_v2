'use client';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { GIP_ROLES } from '@/lib/modules/moduleRole';
import * as React from 'react';
import useSWR from 'swr/immutable';

type Item = { name: string; is_dir: boolean };

function joinPath(base: string, seg: string) {
  if (!base) return seg.replace(/^\/+/, '');
  return `${base.replace(/\/+$/, '')}/${seg.replace(/^\/+/, '')}`;
}
function parentDir(p: string) {
  const parts = p.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}
function buildPreviewUrl(rel: string) {
  const u = new URL('/gip/download', window.location.origin);
  u.searchParams.set('filepath', rel);
  u.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');
  return u.toString();
}

export default function GipBrowserLite() {
  const [folder, setFolder] = React.useState('');
  const [selected, setSelected] = React.useState('');
  const [loadingPrev, setLoadingPrev] = React.useState(false);
  const [prevErr, setPrevErr] = React.useState('');
  const key = `/gip/search${
    folder
      ? `?filepath=${encodeURIComponent(folder)}&api_key=${process.env.NEXT_PUBLIC_PYTHON_API_KEY}`
      : ''
  }`;

  const previewUrl = React.useMemo(() => {
    return selected ? buildPreviewUrl(selected) : '';
  }, [selected]);
  const { data, isLoading, error } = useSWR<Item[]>(key, axiosFetcher);

  React.useEffect(() => {
    if (selected) {
      setLoadingPrev(true);
      setPrevErr('');
    }
  }, [selected]);

  const atRoot = !folder || folder === '/';

  return (
    <AccessGuard allowedRoles={GIP_ROLES}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => {
              setFolder('');
              setSelected('');
            }}
            disabled={atRoot}
            className="text-blue-600 hover:underline disabled:text-gray-400"
          >
            /
          </button>
          {folder
            .split('/')
            .filter(Boolean)
            .map((seg, i, a) => {
              const p = a.slice(0, i + 1).join('/');
              return (
                <React.Fragment key={p}>
                  <span>/</span>
                  <button
                    onClick={() => {
                      setFolder(p);
                      setSelected('');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {seg}
                  </button>
                </React.Fragment>
              );
            })}
          <div className="ml-auto flex items-center gap-2">
            {!atRoot && (
              <button
                onClick={() => {
                  setFolder(parentDir(folder));
                  setSelected('');
                }}
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                Atrás
              </button>
            )}
            {selected && (
              <button
                onClick={() => {
                  setSelected('');
                }}
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                Cerrar visor
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border rounded-md overflow-y-auto max-h-[80vh]">
            {isLoading && <div className="p-3 text-gray-500">Cargando…</div>}
            {error && <div className="p-3 text-red-600">Error al cargar.</div>}
            {Array.isArray(data) && data.length === 0 && (
              <div className="p-3 text-gray-500">Carpeta vacía.</div>
            )}

            {Array.isArray(data) &&
              data.map((it, i) => {
                const rel = joinPath(folder, it.name);
                const selectedRow = !it.is_dir && selected === rel;
                return (
                  <button
                    key={rel}
                    onClick={() => (it.is_dir ? setFolder(rel) : setSelected(rel))}
                    title={it.name}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 border-b last:border-b-0 ${
                      selectedRow
                        ? 'bg-blue-50 border-l-4 border-blue-400'
                        : i % 2
                        ? 'bg-white'
                        : 'bg-gray-50'
                    } hover:bg-gray-100`}
                  >
                    <span aria-hidden>{it.is_dir ? '📁' : '📄'}</span>
                    <span className="truncate">{it.name}</span>
                  </button>
                );
              })}
          </div>

          <div className="relative border rounded-md min-h-[300px] h-[80vh] overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Selecciona un archivo para previsualizar
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 px-3 py-2 border-b bg-gray-50">
                  <span className="text-xs uppercase text-gray-500">Vista previa:</span>
                  <span className="font-medium truncate">{selected.split('/').pop()}</span>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  {loadingPrev && (
                    <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                    </div>
                  )}
                  {prevErr && !loadingPrev && (
                    <div className="absolute inset-0 z-10 bg-white/90 flex items-center justify-center p-6 text-center">
                      <div className="text-red-600">No se pudo cargar la vista previa.</div>
                    </div>
                  )}
                  <iframe
                    key={selected}
                    src={previewUrl}
                    className="w-full h-full"
                    frameBorder={0}
                    onLoad={() => setLoadingPrev(false)}
                    onError={() => {
                      setLoadingPrev(false);
                      setPrevErr('');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessGuard>
  );
}
