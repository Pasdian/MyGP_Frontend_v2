/**
 * Glosa API client.
 *
 * v1: All functions return mock data behind the USE_MOCK flag.
 * To wire the real backend, set USE_MOCK = false and ensure
 * glosa_schema.sql has been executed against GPascal (Firebird).
 */

import {
  MOCK_GLOSAS,
  MOCK_ERRORES_INITIAL,
  MOCK_GLOSADORES,
} from './mockData';
import type { Glosa, GlosaError, GlosadorLoad, ViewerRole } from './types';

const USE_MOCK = true; // flip to false when backend is wired to Firebird

/** Returns list of glosas filtered by role. */
export async function fetchGlosas(
  role: ViewerRole,
  userLabel?: string
): Promise<Glosa[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 50));
    if (role === 'admin') return MOCK_GLOSAS;
    if (role === 'glosador')
      return MOCK_GLOSAS.filter(
        (g) => g.glosador === (userLabel ?? 'María G.')
      );
    return MOCK_GLOSAS.filter((g) => g.kam === (userLabel ?? 'Javier R.'));
  }
  const res = await fetch(`/pyapi/glosa/list?role=${role}`);
  if (!res.ok) throw new Error('failed to load glosas');
  const json = await res.json();
  return json.glosas;
}

/** Returns detail for a single glosa including its errors/annotations. */
export async function fetchGlosa(
  id: string
): Promise<{ glosa: Glosa; errores: GlosaError[] }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 50));
    const glosa = MOCK_GLOSAS.find((g) => g.id === id) ?? MOCK_GLOSAS[0];
    return { glosa, errores: MOCK_ERRORES_INITIAL };
  }
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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 30));
    return { error_id: String(Date.now()) };
  }
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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 30));
    return;
  }
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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 30));
    return;
  }
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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 50));
    return {
      glosas_activas: 14,
      t_prom_qa: '1h 52m',
      t_prom_kam: '4h 18m',
      cerradas_30d: 142,
      errores_30d: 287,
    };
  }
  const res = await fetch(`/pyapi/glosa/kpis?scope=${scope}`);
  if (!res.ok) throw new Error('failed to load kpis');
  return res.json();
}

/** Returns glosador load cards and recent assignments. */
export async function fetchAsignaciones(): Promise<{
  glosadores: GlosadorLoad[];
  recientes: Glosa[];
}> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 50));
    return {
      glosadores: MOCK_GLOSADORES,
      recientes: MOCK_GLOSAS.slice(0, 5),
    };
  }
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
}): Promise<{ glosa_id: string; glosador_id: string; status: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 80));
    return { glosa_id: 'mock-' + Date.now(), glosador_id: 'mock-glosador', status: 'nueva' };
  }
  const res = await fetch('/pyapi/glosa/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('failed to create glosa');
  return res.json();
}
