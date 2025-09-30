'use client';
import * as React from 'react';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import axios from 'axios';

type Props = { filepath: string }; // relative inside the SMB share (e.g. "dir1/file.xlsx")

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

function DocumentViewer({ filepath }: Props) {
  const ext = filepath.split('.').pop()?.toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') return <ExcelViewer filepath={filepath} />;
  if (ext === 'docx') return <DocxViewer filepath={filepath} />;
  if (ext === 'doc') {
    // Fallback to Office/Google viewer via your own URL (must be reachable by them to work)
    const fileUrl = `${window.location.origin}/gip/download?filepath=${encodeURIComponent(
      filepath
    )}`;
    return (
      <iframe
        className="w-full h-[80vh]"
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
      />
    );
  }
  return <div>Unsupported file type.</div>;
}

function ExcelViewer({ filepath }: { filepath: string }) {
  const [sheets, setSheets] = React.useState<{ name: string; rows: unknown[][] }[]>([]);
  React.useEffect(() => {
    (async () => {
      const url = `/gip/download?filepath=${encodeURIComponent(filepath)}`;
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      const wb = XLSX.read(new Uint8Array(res.data), { type: 'array' });
      const all = wb.SheetNames.map((name) => ({
        name,
        rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 }) as unknown[][],
      }));
      setSheets(all);
    })();
  }, [filepath]);

  return (
    <div className="space-y-4 overflow-y-auto max-h-[80vh]">
      {sheets.map((sheet) => (
        <div key={sheet.name}>
          <div className="font-semibold mb-2">{sheet.name}</div>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <tbody>
                {sheet.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 border-r whitespace-pre">
                        {cell !== null && cell !== undefined ? String(cell) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocxViewer({ filepath }: { filepath: string }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    (async () => {
      const url = `/gip/download?filepath=${encodeURIComponent(filepath)}`;
      const res = await fetch(url, {
        headers: {
          'X-API-KEY': '5ac57fd5-caf1-4768-98a1-e97bfb803a70',
        },
      });
      // credentials: "include", // if you also rely on cooki
      const buf = await res.arrayBuffer();

      // Approach 1: mammoth -> HTML (cleaner text, loses complex formatting)
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
      if (containerRef.current) containerRef.current.innerHTML = html;

      // Approach 2 (alternative): docx-preview renders closer to Word layout
      // await renderDocx(new Blob([buf]), containerRef.current!, null, { inWrapper: false });
    })();
  }, [filepath]);

  return <div ref={containerRef} className="prose max-w-none overflow-y-auto max-h-[80vh]" />;
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
            <button className="px-2 py-1 rounded border hover:bg-gray-50" onClick={goUp}>
              Up one level
            </button>
          )}
          {selectedFile && (
            <button
              className="px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => setSelectedFile('')}
              title="Close viewer"
            >
              Close viewer
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
                  {!item.is_dir && (
                    <span className="text-sm text-blue-600 hover:underline shrink-0">Preview</span>
                  )}
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
                <a
                  className="ml-auto text-blue-600 hover:underline text-sm"
                  href={`/gip/download?filepath=${encodeURIComponent(selectedFile)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
                <button
                  className="px-2 py-1 rounded border hover:bg-white text-sm"
                  onClick={() => setSelectedFile('')}
                  title="Close viewer"
                >
                  Close
                </button>
              </div>

              {/* Viewer body */}
              <div className="flex-1 overflow-auto">
                <DocumentViewer filepath={selectedFile} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
