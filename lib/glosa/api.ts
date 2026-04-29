import type { Glosa, GlosaError, GlosadorLoad, ViewerRole } from './types';

/** Returns list of glosas filtered by role. */
export async function fetchGlosas(
  role: ViewerRole,
  userId?: string
): Promise<Glosa[]> {
  const params = new URLSearchParams({ role });
  if (userId) params.set('user_id', userId);
  const res = await fetch(`/pyapi/glosa/list?${params}`);
  if (!res.ok) throw new Error('failed to load glosas');
  const json = await res.json();
  return json.glosas;
}

/** Returns detail for a single glosa including its errors/annotations. */
export async function fetchGlosa(
  id: string
): Promise<{ glosa: Glosa; errores: GlosaError[] }> {
  const res = await fetch(`/pyapi/glosa/${id}`);
  if (!res.ok) throw new Error(`failed to load glosa ${id}`);
  const json = await res.json();
  return { glosa: json.glosa, errores: json.errores };
}

/** Creates a new annotation (pin) on a glosa. Returns echo with generated id. */
export async function createError(
  glosaId: string,
  payload: Partial<GlosaError>
): Promise<{ error_id: string }> {
  const res = await fetch(`/pyapi/glosa/${glosaId}/error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('failed to create error');
  return res.json();
}

/** Deletes an annotation from a glosa. */
export async function deleteError(
  glosaId: string,
  errorId: number
): Promise<void> {
  const res = await fetch(`/pyapi/glosa/${glosaId}/error/${errorId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('failed to delete error');
}

/** Transitions a glosa to a new estado. */
export async function updateEstado(
  glosaId: string,
  estado: string
): Promise<void> {
  const res = await fetch(`/pyapi/glosa/${glosaId}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error('failed to update estado');
}

/** Returns KPI aggregates. */
export async function fetchKpis(
  scope: 'admin' | 'glosador'
): Promise<Record<string, unknown>> {
  const res = await fetch(`/pyapi/glosa/kpis?scope=${scope}`);
  if (!res.ok) throw new Error('failed to load kpis');
  return res.json();
}

/** Returns glosador load cards and recent assignments. */
export async function fetchAsignaciones(): Promise<{
  glosadores: GlosadorLoad[];
  recientes: Glosa[];
}> {
  const res = await fetch('/pyapi/glosa/asignaciones');
  if (!res.ok) throw new Error('failed to load asignaciones');
  const json = await res.json();
  return { glosadores: json.glosadores, recientes: json.asignaciones_recientes };
}

/** Creates a new glosa (KAM upload flow). Returns glosa_id + assigned glosador. */
export async function createGlosa(payload: {
  referencia: string;
  tipo_operacion: string;
  prioridad: string;
  comentario_kam?: string;
  ejecutivo_id: string;
  cliente?: string;
  cliente_cve?: string;
  aduana_nombre?: string;
  num_pedimento?: string;
  monto_display?: string;
}): Promise<{ glosa_id: string; glosador_id: string; status: string }> {
  const res = await fetch('/pyapi/glosa/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('failed to create glosa');
  return res.json();
}

export async function checkReferencia(ref: string): Promise<boolean> {
  const res = await fetch(
    `/pyapi/glosa/check-referencia?ref=${encodeURIComponent(ref)}`,
  );
  if (res.status === 404) return false;
  if (!res.ok) throw new Error('failed to check referencia');
  return true;
}
