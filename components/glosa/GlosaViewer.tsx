'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pin, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PinOverlay from './PinOverlay';
import PinList from './PinList';
import PinModal from './PinModal';
import ViewerToolbar from './ViewerToolbar';
import OpInfoPanel from './OpInfoPanel';
import ValidationsPanel from './ValidationsPanel';
import { MOCK_ERRORES_INITIAL, MOCK_FILES, MOCK_OP_INFO } from '@/lib/glosa/mockData';
import { updateEstado } from '@/lib/glosa/api';
import type { GlosaError, ViewerLayout, ViewerRole, ErrorType } from '@/lib/glosa/types';

type Props = {
  glosaId: string;
  role: ViewerRole;
  initialLayout?: ViewerLayout;
  onBack?: () => void;
};

type Draft = { x: number; y: number; file: string; fileKey: string; page: number } | null;

// Admin can read but not annotate (read-only for v1 — annotation permission model TBD)
function isReadOnly(role: ViewerRole) {
  return role === 'kam' || role === 'admin';
}

export default function GlosaViewer({ glosaId, role, initialLayout = 'split', onBack }: Props) {
  const router = useRouter();
  const readOnly = isReadOnly(role);

  const [layout, setLayout] = useState<ViewerLayout>(initialLayout);
  const [paused, setPaused] = useState(false);
  const [pins, setPins] = useState<GlosaError[]>(() =>
    MOCK_ERRORES_INITIAL.map((e, i) => ({ ...e, idx: i + 1 }))
  );
  const [activePinId, setActivePinId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(null);
  const [leftFile, setLeftFile] = useState('pedimento');
  const [rightFile, setRightFile] = useState('factura');
  const [singleFile, setSingleFile] = useState('pedimento');

  const fileOf = (k: string) => MOCK_FILES.find((f) => f.key === k) ?? MOCK_FILES[0];

  const addPinAt = (pos: { x: number; y: number }, fileKey: string) => {
    const f = fileOf(fileKey);
    setDraft({ ...pos, file: f.name, fileKey, page: 1 });
  };

  const savePin = ({ type, category, note }: { type: ErrorType; category: string; note: string }) => {
    setPins((ps) => {
      const id = Math.max(0, ...ps.map((p) => p.id)) + 1;
      return [
        ...ps,
        {
          id,
          idx: ps.length + 1,
          file: draft?.file ?? '',
          page: 1,
          x: draft?.x ?? 50,
          y: draft?.y ?? 50,
          type,
          category,
          note,
          status: 'open',
          createdAt: 'ahora',
        },
      ];
    });
    setDraft(null);
  };

  const resolvePin = (p: GlosaError) =>
    setPins((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: 'resolved' } : x)));

  const deletePin = (p: GlosaError) =>
    setPins((prev) => prev.filter((x) => x.id !== p.id));

  const handleFileChange = (fileKey: string, side: 'left' | 'right' | 'single') => {
    if (side === 'left') setLeftFile(fileKey);
    else if (side === 'right') setRightFile(fileKey);
    else setSingleFile(fileKey);
  };

  // Toolbar title / badges
  const title = `${MOCK_OP_INFO.ref} · ${MOCK_OP_INFO.destinatario}`;
  const badges = (
    <>
      <Badge variant="outline" className="text-purple-700">Exportación A1</Badge>
      <Badge variant="outline" className="text-blue-700">{MOCK_OP_INFO.m}</Badge>
    </>
  );

  // Toolbar actions
  const handleRequestChanges = async () => {
    await updateEstado(glosaId, 'en_espera_cambios');
    toast.success(`Glosa enviada al KAM con ${pins.length} cambios solicitados.`);
    router.push('/mygp/glosa/bandeja');
  };

  const handleAccept = async () => {
    await updateEstado(glosaId, 'aceptada');
    toast.success('Glosa aceptada. El KAM puede pagar el pedimento.');
    router.push('/mygp/glosa/bandeja');
  };

  // Render a document panel (PinOverlay + file tab handling)
  const renderDoc = (fileKey: string, accent: string, side: 'left' | 'right' | 'single') => (
    <PinOverlay
      files={MOCK_FILES}
      activeFileKey={fileKey}
      onFileChange={(k) => handleFileChange(k, side)}
      pins={pins}
      activePinId={activePinId}
      readOnly={readOnly}
      accent={accent}
      onClickEmpty={(pos, fk) => !readOnly && addPinAt(pos, fk)}
      onClickPin={(p) => setActivePinId(p.id)}
    />
  );

  let body: React.ReactNode;

  if (layout === 'split') {
    body = (
      <div className="flex h-full min-h-0">
        <div className="flex-1 min-w-0 border-r border-[#E5E5E5]">
          {renderDoc(leftFile, '#3B82F6', 'left')}
        </div>
        <div className="flex-1 min-w-0">{renderDoc(rightFile, '#8B5CF6', 'right')}</div>
      </div>
    );
  } else if (layout === 'single') {
    body = <div className="h-full">{renderDoc(singleFile, '#3B82F6', 'single')}</div>;
  } else if (layout === 'data') {
    body = (
      <div className="flex h-full min-h-0">
        <div className="flex-1 min-w-0 border-r border-[#E5E5E5]">
          {renderDoc(singleFile, '#3B82F6', 'single')}
        </div>
        <div className="w-80 shrink-0 bg-white overflow-hidden flex flex-col">
          <Tabs defaultValue="op" className="flex flex-col h-full">
            <TabsList className="h-auto bg-[#FAFAFA] border-b border-[#E5E5E5] rounded-none p-0">
              {[{ v: 'op', l: 'Operación' }, { v: 'val', l: 'Validaciones' }, { v: 'casa', l: 'CASA DB' }].map((t) => (
                <TabsTrigger key={t.v} value={t.v} className="flex-1 rounded-none text-[11px] font-semibold py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#3B82F6]">
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="op" className="flex-1 overflow-auto m-0"><OpInfoPanel /></TabsContent>
            <TabsContent value="val" className="flex-1 overflow-auto m-0"><ValidationsPanel /></TabsContent>
            <TabsContent value="casa" className="flex-1 overflow-auto m-0 p-3 text-[11px]">
              <div className="text-[#737373] mb-2">Datos traídos de Sistemas CASA (mock):</div>
              <div className="space-y-1 font-mono text-[10px] bg-[#FAFAFA] border border-[#E5E5E5] rounded p-2">
                <div>{'op.referencia = "PAE260036"'}</div>
                <div>{'op.cliente_id = 4021 (TRANSBEL)'}</div>
                <div>{'op.ejecutivo = "javier@pascal.com.mx"'}</div>
                <div>{'op.etapa_actual = "En glosa"'}</div>
                <div>{'op.factura_valor = 24655.24'}</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } else if (layout === 'errors') {
    body = (
      <div className="flex h-full min-h-0">
        <div className="flex-1 min-w-0 border-r border-[#E5E5E5]">
          {renderDoc(singleFile, '#3B82F6', 'single')}
        </div>
        <div className="w-[340px] shrink-0 bg-white flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#E5E5E5] bg-[#FAFAFA] shrink-0">
            <div className="flex items-center gap-1.5">
              <Pin className="h-3.5 w-3.5" />
              <span className="text-[12px] font-semibold">Anotaciones</span>
              <Badge variant="destructive">{pins.length}</Badge>
            </div>
            {!readOnly && (
              <Button variant="ghost" size="sm" onClick={() => setDraft({ x: 50, y: 50, file: fileOf(singleFile).name, fileKey: singleFile, page: 1 })}>
                <Plus className="h-3.5 w-3.5 mr-1" />Manual
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            <PinList pins={pins} activePinId={activePinId} onSelect={(p) => setActivePinId(p.id)} onResolve={resolvePin} onDelete={deletePin} readOnly={readOnly} />
          </div>
          {!readOnly && (
            <div className="border-t border-[#E5E5E5] p-2 bg-white shrink-0">
              <div className="text-[10px] uppercase text-[#737373] font-semibold mb-1">Comentario general</div>
              <textarea rows={2} placeholder="Contexto general de la glosa para el KAM…" className="w-full resize-none rounded-md border border-[#E5E5E5] bg-white p-1.5 text-[11px]" />
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // validations
    body = (
      <div className="flex h-full min-h-0">
        <div className="flex-1 min-w-0 border-r border-[#E5E5E5]">
          {renderDoc(singleFile, '#3B82F6', 'single')}
        </div>
        <div className="w-80 shrink-0 bg-white flex flex-col">
          <div className="px-3 py-2 border-b border-[#E5E5E5] bg-[#FAFAFA] shrink-0">
            <div className="text-[12px] font-semibold">Validaciones automáticas</div>
            <div className="text-[10px] text-[#737373]">Archivo M vs factura vs CASA DB</div>
          </div>
          <div className="flex-1 overflow-auto"><ValidationsPanel /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ViewerToolbar
        title={title}
        badges={badges}
        paused={paused}
        onToggleTimer={() => setPaused((p) => !p)}
        layout={layout}
        onLayoutChange={setLayout}
        readOnly={readOnly}
        onBack={onBack ?? (() => router.back())}
        onRequestChanges={handleRequestChanges}
        onAccept={handleAccept}
      />
      {/* Override KAM toolbar action */}
      {readOnly && role === 'kam' && (
        <div className="absolute right-3 top-2 hidden" aria-hidden>
          {/* KAM's "Responder" action is embedded in ViewerToolbar via readOnly prop */}
        </div>
      )}

      <div className="flex-1 min-h-0">{body}</div>

      {/* Bottom dock — shown when layout is not 'errors' (which already has a side panel) */}
      {layout !== 'errors' && (
        <div className="shrink-0 border-t border-[#E5E5E5] bg-white max-h-44 overflow-auto">
          <div className="flex items-center justify-between px-3 py-1.5 sticky top-0 bg-[#FAFAFA] border-b border-[#E5E5E5]">
            <div className="flex items-center gap-1.5">
              <Pin className="h-3 w-3" />
              <span className="text-[11px] font-semibold">Anotaciones ({pins.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#737373]">Click en el documento para agregar una</span>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDraft({ x: 50, y: 50, file: fileOf(leftFile).name, fileKey: leftFile, page: 1 })
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />Error manual
                </Button>
              )}
            </div>
          </div>
          <div className="flex overflow-x-auto gap-2 p-2">
            {pins.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePinId(p.id)}
                className={`shrink-0 w-64 text-left p-2 rounded-md border ${
                  activePinId === p.id
                    ? 'border-[#3B82F6] bg-blue-50/40'
                    : 'border-[#E5E5E5] bg-white hover:bg-[#FAFAFA]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                      p.status === 'resolved' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                    }`}
                  >
                    {p.idx}
                  </div>
                  <Badge variant="outline" className="text-[9px]">{p.type}</Badge>
                </div>
                <div className="text-[11px] font-semibold truncate">{p.category}</div>
                <div className="text-[10px] text-[#737373] line-clamp-2">{p.note}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <PinModal
        open={!!draft}
        draft={draft}
        onSave={savePin}
        onCancel={() => setDraft(null)}
      />
    </div>
  );
}
