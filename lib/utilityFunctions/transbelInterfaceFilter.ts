type InterfaceRecord = {
  REFERENCIA: string | null;
  EE__GE?: string | null;
  REVALIDACION_073?: string | null;
  ULTIMO_DOCUMENTO_114?: string | null;
  ENTREGA_TRANSPORTE_138?: string | null;
  MSA_130?: string | null;
  ENTREGA_CDP_140?: string | null;
  workato_entrega_cdp_140?: string | null;
  workato_msa_130?: string | null;
  workato_revalidacion_073?: string | null;
  workato_ultimo_documento_114?: string | null;
  workato_entrega_transporte_138?: string | null;
  workato_ee__ge?: string | null;
  [key: string]: unknown;
};

/**
 * From an array of records, returns ONE record per REFERENCIA core.
 * Core = P + 2 capital letters + 6 digits (e.g. PVI251574),
 * even if REFERENCIA is like RPVI251574, PVI251574A, etc.
 *
 * Selection rules within each core:
 *   1) Highest entrega_cdp_140 (workato_entrega_cdp_140 or ENTREGA_CDP_140)
 *   2) If tie, highest msa_130 (workato_msa_130 or MSA_130)
 *   3) If tie, prefer the one whose REFERENCIA === core (no prefix/suffix)
 */
export function pickBestByReferenciaCore<T extends InterfaceRecord>(
  records: T[]
): T[] {
  const coreRegex = /P[A-Z]{2}\d{6}/;
  const groups = new Map<string, T[]>();

  // Helpers to read the correct fields, supporting both schemas
  const getEntregaCdp = (o: InterfaceRecord): string =>
    o.workato_entrega_cdp_140 ?? o.ENTREGA_CDP_140 ?? "";

  const getMsa130 = (o: InterfaceRecord): string =>
    o.workato_msa_130 ?? o.MSA_130 ?? "";

  const getRevalidacion = (o: InterfaceRecord): string =>
    o.workato_revalidacion_073 ?? o.REVALIDACION_073 ?? "";

  const getUltimoDocumento = (o: InterfaceRecord): string =>
    o.workato_ultimo_documento_114 ?? o.ULTIMO_DOCUMENTO_114 ?? "";

  const getEntregaTransporte = (o: InterfaceRecord): string =>
    o.workato_entrega_transporte_138 ?? o.ENTREGA_TRANSPORTE_138 ?? "";

  const getEeGe = (o: InterfaceRecord): string =>
    o.workato_ee__ge ?? o.EE__GE ?? "";

  const hasAllRequired = (o: InterfaceRecord): boolean => {
    // These are the fields you said must be populated
    const fields = [
      getEeGe(o),
      getRevalidacion(o),
      getUltimoDocumento(o),
      getMsa130(o),
      getEntregaTransporte(o),
      getEntregaCdp(o),
    ];
    return fields.every((v) => v !== null && v !== undefined && v !== "");
  };

  const isCoreRef = (o: InterfaceRecord, core: string): boolean =>
    o.REFERENCIA === core;

  const isBetter = (
    candidate: InterfaceRecord,
    current: InterfaceRecord,
    core: string
  ): boolean => {
    const cEntrega = getEntregaCdp(candidate);
    const oEntrega = getEntregaCdp(current);

    if (cEntrega !== oEntrega) {
      // Dates in fixed format compare correctly as strings
      return cEntrega > oEntrega; // higher (later) wins
    }

    const cMsa = getMsa130(candidate);
    const oMsa = getMsa130(current);

    if (cMsa !== oMsa) {
      return cMsa > oMsa; // higher (later) wins
    }

    const candIsCore = isCoreRef(candidate, core);
    const currIsCore = isCoreRef(current, core);

    if (candIsCore !== currIsCore) {
      return candIsCore; // true > false
    }

    // If still tied, keep current (stable choice)
    return false;
  };

  // 1) Group by REFERENCIA core, but only include fully populated records
  for (const rec of records) {
    if (!rec || !rec.REFERENCIA) continue;

    const match = rec.REFERENCIA.match(coreRegex);
    if (!match) continue;

    const core = match[0];

    if (!hasAllRequired(rec)) continue;

    if (!groups.has(core)) groups.set(core, []);
    groups.get(core)?.push(rec);
  }

  // 2) For each core, pick the "best" record according to rules
  const result: T[] = [];

  for (const [core, recs] of groups.entries()) {
    let best = recs[0];
    for (let i = 1; i < recs.length; i++) {
      if (isBetter(recs[i], best, core)) {
        best = recs[i];
      }
    }
    result.push(best);
  }

  return result;
}
