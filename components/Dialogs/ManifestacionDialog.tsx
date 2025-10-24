import * as React from 'react';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { ManifestacionTree } from '../Trees/ManifestacionTree';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import { MyGPTabs } from '../MyGPUI/Tabs/MyGPTabs';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import { Text } from 'lucide-react';
const TAB_VALUES = ['upload', 'list'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}
type Section = {
  label: string;
  dest: string;
  mandatory?: boolean;
  file: File | null;
};

export function ManifestacionDialog() {
  const { clientNumber: client, reference } = useDEAStore((s) => s);
  const [tabValue, setTabValue] = React.useState<'upload' | 'list'>('upload');

  const makeSections = React.useCallback(
    (): Section[] => [
      {
        label: 'Factura Comercial (Obligatorio)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/FACTURA-COMERCIAL`,
        mandatory: true,
        file: null,
      },
      {
        label: 'Embarque (Obligatorio)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/EMBARQUE`,
        mandatory: true,
        file: null,
      },
      {
        label: 'Compruebe de Origen (Opcional)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/COMPRUEBE-ORIGEN`,
        file: null,
      },
      {
        label: 'Garantía (Opcional)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/GARANTIA`,
        file: null,
      },
      {
        label: 'Pago de Mercancías (Obligatorio)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/PAGO-MERCANCIAS`,
        mandatory: true,
        file: null,
      },
      {
        label: 'Gastos Transporte / Seguros / Gastos Conexos (Opcional)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/GASTOS-TRANSPORTE-SEGUROS-GASTOS-CONEXOS`,
        file: null,
      },
      {
        label: 'Contratos (Opcional)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/CONTRATOS`,
        file: null,
      },
      {
        label: 'Incrementables (Opcional)',
        dest: `/GESTION/${client}/${reference}/06-MANIFESTACION-VALOR/INCREMENTABLES`,
        file: null,
      },
    ],
    [client, reference]
  );

  return (
    <MyGPDialog
      title="Subir manifestación de valor"
      description="Selecciona los archivos requeridos y opcionales."
      trigger={
        <MyGPButtonPrimary className="mb-4 text-xs">
          <Text />
          <span className="ml-1">Manifestación de Valor</span>
        </MyGPButtonPrimary>
      }
    >
      <MyGPTabs
        defaultValue="upload"
        value={tabValue}
        onValueChange={(v) => isTabValue(v) && setTabValue?.(v)}
        tabs={[
          {
            value: 'upload',
            label: 'Subir archivos',
          },
          {
            value: 'list',
            label: 'Listar archivos',
          },
        ]}
      />
      {tabValue === 'upload' ? (
        <UploadManifestacionContent makeSections={makeSections} />
      ) : (
        <ManifestacionTree client={client} reference={reference} />
      )}
    </MyGPDialog>
  );
}

function UploadManifestacionContent({ makeSections }: { makeSections: () => Section[] }) {
  const [sections, setSections] = React.useState<Section[]>(() => makeSections());
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setSections(makeSections());
  }, [makeSections]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeDest, setActiveDest] = React.useState<string | null>(null);

  const openPicker = (dest: string) => {
    setActiveDest(dest);
    fileInputRef.current?.click();
  };

  const onPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!activeDest) return;
    setSections((prev) => prev.map((s) => (s.dest === activeDest ? { ...s, file: f } : s)));
    e.target.value = '';
  };

  async function uploadOne(destPath: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    await GPClient.post('/dea/uploadFile', fd, {
      params: { destination: destPath },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  const onSubmit = async () => {
    setErrorMsg(null);
    const missing = sections.filter((s) => s.mandatory && !s.file);
    if (missing.length) {
      setErrorMsg('Faltan archivos obligatorios.');
      return;
    }
    const toUpload = sections.filter((s) => s.file);
    if (!toUpload.length) {
      setErrorMsg('No hay archivos seleccionados.');
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all(toUpload.map((s) => uploadOne(s.dest, s.file as File)));
      setSections((prev) => prev.map((s) => ({ ...s, file: null })));
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error al subir archivos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" className="hidden" onChange={onPicked} />

      <div className="grid gap-3 h-[480px] overflow-y-auto">
        {sections.map(({ label, dest, mandatory, file }) => (
          <div
            key={dest}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-gray-100 pb-2"
          >
            <p className={`text-sm leading-snug ${mandatory ? 'text-red-600' : 'text-gray-700'}`}>
              {label}
            </p>

            <MyGPButtonPrimary
              type="button"
              onClick={() => openPicker(dest)}
              disabled={submitting}
              className="
    h-8 w-fit max-w-[180px]
    justify-start text-left px-3
    overflow-hidden
    rounded-md text-sm
  "
            >
              <span className="min-w-0 block truncate whitespace-nowrap">
                {file ? file.name : 'Seleccionar'}
              </span>
            </MyGPButtonPrimary>
          </div>
        ))}
      </div>

      {errorMsg && <span className="block text-sm text-red-600 mt-2 text-center">{errorMsg}</span>}

      <div className="mt-3 flex justify-end">
        <MyGPButtonPrimary
          type="button"
          className="bg-blue-500 hover:bg-blue-600 w-full"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Enviando…' : 'Enviar archivos'}
        </MyGPButtonPrimary>
      </div>
    </>
  );
}
