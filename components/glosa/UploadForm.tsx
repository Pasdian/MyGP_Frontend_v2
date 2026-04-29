'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { ClientsController } from '@/components/expediente-digital-cliente/form-controllers/ClientsController';
import { Send, Eye, X, Upload, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { checkReferencia, createGlosa } from '@/lib/glosa/api';
import type { ExpedienteRow } from '@/lib/glosa/types';

type FileState = { file: string; size: string; uploaded: string } | null;

const INITIAL_EXPEDIENTE: ExpedienteRow[] = [
  { key: 'proforma',  label: 'Proforma de pedimento',       required: true,  file: null, size: null, uploaded: null },
  { key: 'bl',        label: 'Guía Aérea / Bill of Lading', required: true,  file: null, size: null, uploaded: null },
  { key: 'factura',   label: 'Factura comercial',           required: true,  file: null, size: null, uploaded: null },
  { key: 'carta318',  label: 'Carta 3.1.8',                 required: false, file: null, size: null, uploaded: null, hint: 'Sólo importación' },
  { key: 'cove',      label: 'COVE',                        required: true,  file: null, size: null, uploaded: null },
  { key: 'm',         label: 'Archivo M (CAAAREM)',         required: true,  file: null, size: null, uploaded: null },
  { key: 'extras',    label: 'Soporte adicional',           required: false, file: null, size: null, uploaded: null },
];

const VALIDACIONES = [
  { label: 'Formato y cantidad de archivos correctos', ok: true,  hint: 'Verificado al subir' },
  { label: 'Valor factura vs pedimento',               ok: false, hint: 'El glosador revisará' },
  { label: 'Incoterm pedimento vs factura',            ok: false, hint: 'El glosador revisará' },
];

function DropZoneTile({
  row,
  fileState,
  onAttach,
  onRemove,
}: {
  row: ExpedienteRow;
  fileState: FileState;
  onAttach: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaded = fileState ?? (row.file ? { file: row.file, size: row.size ?? '', uploaded: row.uploaded ?? '' } : null);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border-2 border-dashed p-3 ${
        uploaded
          ? 'border-[#22C55E] bg-green-50/30'
          : row.required
          ? 'border-[#E5E5E5] bg-white hover:bg-[#FAFAFA]'
          : 'border-[#E5E5E5] bg-[#FAFAFA]'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          uploaded ? 'bg-[#22C55E] text-white' : 'bg-[#F5F5F5] text-[#737373]'
        }`}
      >
        {uploaded ? <Check className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">{row.label}</span>
          {row.required ? (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Obligatorio</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Opcional</Badge>
          )}
          {row.hint && <span className="text-[10px] text-[#737373]">· {row.hint}</span>}
        </div>
        {uploaded ? (
          <div className="text-[11px] text-[#737373] mt-0.5 font-mono truncate">
            {uploaded.file} · {uploaded.size} · {uploaded.uploaded}
          </div>
        ) : (
          <div className="text-[11px] text-[#737373] mt-0.5">
            Arrastra o selecciona archivo · PDF/XML/TXT, máx. 10 MB
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onAttach(f);
        }}
      />
      {uploaded ? (
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={onRemove}><X className="h-3.5 w-3.5" /></Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="shrink-0">
          <Upload className="h-3.5 w-3.5 mr-1" />Seleccionar
        </Button>
      )}
    </div>
  );
}

type Company = { CVE_IMP: string; NOM_IMP: string };
type ClientForm = { client: string };

export default function UploadForm() {
  const router = useRouter();
  const { control, getValues } = useForm<ClientForm>({ defaultValues: { client: '' } });
  const { data: companies } = useSWR<Company[]>('/api/companies/getAllCompanies', axiosFetcher);
  const [ref, setRef] = useState('');
  const [aduana, setAduana] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState('exportacion');
  const [prioridad, setPrioridad] = useState('normal');
  const [expediente] = useState<ExpedienteRow[]>(INITIAL_EXPEDIENTE);
  const [fileStates, setFileStates] = useState<Record<string, FileState>>({});

  const reqTotal = expediente.filter((e) => e.required).length;
  const reqFilled = expediente.filter((e) => {
    const fs = fileStates[e.key];
    return e.required && (fs !== undefined ? fs !== null : e.file !== null);
  }).length;
  const filledCount = expediente.filter((e) => {
    const fs = fileStates[e.key];
    return fs !== undefined ? fs !== null : e.file !== null;
  }).length;
  const canSubmit = reqFilled === reqTotal && ref.trim().length > 0 && !!getValues('client');

  const handleSubmit = async () => {
    const cve = getValues('client');
    const nombre = companies?.find((c) => c.CVE_IMP === cve)?.NOM_IMP ?? cve;
    try {
      const refExists = await checkReferencia(ref.trim());
      if (!refExists) {
        toast.error('Referencia no existe');
        return;
      }
      await createGlosa({
        referencia: ref.trim(),
        tipo_operacion: tipoOperacion,
        prioridad,
        ejecutivo_id: '',
        cliente: nombre || undefined,
        cliente_cve: cve || undefined,
        aduana_nombre: aduana.trim() || undefined,
      });
      toast.success('Glosa enviada correctamente.');
      router.push('/mygp/glosa/mis-glosas');
    } catch {
      toast.error('Error al enviar la glosa.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#E5E5E5] bg-white px-4 py-4 shrink-0">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#737373] font-semibold">
              Módulo de Glosa · KAM
            </div>
            <h1 className="text-xl font-bold">Enviar a Glosa</h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Carga el expediente completo. El sistema valida automáticamente y asigna un glosador por carga actual.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>Cancelar</Button>
            <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>
              <Send className="h-3.5 w-3.5 mr-1" />
              Enviar a Glosa
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Left column */}
          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Datos de la operación</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-[12px]">
                  <div>
                    <Label className="text-[10px] uppercase text-[#737373] font-semibold">Referencia</Label>
                    <Input value={ref} onChange={(e) => setRef(e.target.value)} className="h-8 mt-1" placeholder="Ej. PAE260036" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-[#737373] font-semibold">Cliente</Label>
                    <div className="mt-1">
                      <ClientsController control={control} name="client" label="" placeholder="Selecciona un cliente" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-[#737373] font-semibold">Tipo de operación</Label>
                    <Select value={tipoOperacion} onValueChange={setTipoOperacion}>
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exportacion">Exportación (A1)</SelectItem>
                        <SelectItem value="importacion">Importación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-[#737373] font-semibold">Aduana</Label>
                    <Input value={aduana} onChange={(e) => setAduana(e.target.value)} className="h-8 mt-1" placeholder="Ej. AICM" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-[#737373] font-semibold">Prioridad</Label>
                    <Select value={prioridad} onValueChange={setPrioridad}>
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Expediente</CardTitle>
                    <p className="text-[11px] text-[#737373]">
                      {filledCount} de {expediente.length} archivos · {reqFilled}/{reqTotal} obligatorios
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(reqFilled / reqTotal) * 100} className="w-40 h-1.5" />
                    <span className="text-[11px] font-semibold">
                      {Math.round((reqFilled / reqTotal) * 100)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expediente.map((row) => (
                    <DropZoneTile
                      key={row.key}
                      row={row}
                      fileState={fileStates[row.key] ?? null}
                      onAttach={(f) =>
                        setFileStates((prev) => ({
                          ...prev,
                          [row.key]: {
                            file: f.name,
                            size: `${Math.round(f.size / 1024)} KB`,
                            uploaded: new Date().toLocaleDateString('es-MX'),
                          },
                        }))
                      }
                      onRemove={() =>
                        setFileStates((prev) => ({ ...prev, [row.key]: null }))
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm">Comentarios para el glosador</CardTitle>
                <p className="text-[11px] text-[#737373]">Opcional. Aparece en la ficha de la glosa.</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={3}
                  placeholder="Ej. El proveedor pidió cambio de incoterm a última hora, revisar factura actualizada."
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Validaciones automáticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {VALIDACIONES.map((v, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px]">
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          v.ok ? 'bg-[#22C55E]' : 'bg-[#EAB308]'
                        } text-white`}
                      >
                        {v.ok ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <AlertTriangle className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={v.ok ? '' : 'font-semibold'}>{v.label}</div>
                        <div className="text-[11px] text-[#737373]">{v.hint}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Asignación propuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg bg-[#FAFAFA] p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-white text-sm font-bold" style={{ background: '#8B5CF6' }}>
                      ?
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">Auto-asignado</div>
                    <div className="text-[11px] text-[#737373]">Glosador con menor carga actual</div>
                  </div>
                  <Badge variant="outline" className="text-blue-700">Auto</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FAFAFA]">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#EAB308] mt-0.5 shrink-0" />
                  <div className="text-[11px] text-[#737373]">
                    Una vez enviada, la referencia{' '}
                    <b>no podrá ser pagada</b> hasta que el glosador la marque como{' '}
                    <b>Aceptada</b>.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
