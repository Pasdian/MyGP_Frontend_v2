export function isValidRfc(rfcRaw: string): boolean {
  const rfc = (rfcRaw ?? '').trim().toUpperCase();

  // Persona moral: 3 letras + 6 fecha + 3 alfanum (homoclave)
  const moral = /^[A-Z&Ñ]{3}\d{6}[A-Z0-9]{3}$/;

  // Persona física: 4 letras + 6 fecha + 3 alfanum (homoclave)
  const fisica = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/;

  return moral.test(rfc) || fisica.test(rfc);
}

export function isValidUuid(uuidRaw: string | null | undefined): boolean {
  const uuid = (uuidRaw ?? '').trim().toUpperCase();
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(uuid);
}

type ParsedCfdi = {
  receptorRfc: string;
  receptorNombre: string;
  usoCfdi: string;
  uuid: string | null;
  total: string | null;
  fecha: string | null;
  folio: string | null;
};

export function parseCfdiXml(xmlText: string): ParsedCfdi {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  // Detect parse errors
  const parseError = doc.getElementsByTagName('parsererror')[0];
  if (parseError) throw new Error('XML inválido');

  const comprobante = doc.getElementsByTagName('cfdi:Comprobante')[0];
  const receptor = doc.getElementsByTagName('cfdi:Receptor')[0];
  if (!receptor) throw new Error('No se encontró cfdi:Receptor');

  const timbre = doc.getElementsByTagName('tfd:TimbreFiscalDigital')[0] ?? null;

  return {
    receptorRfc: receptor.getAttribute('Rfc') ?? '',
    receptorNombre: receptor.getAttribute('Nombre') ?? '',
    usoCfdi: receptor.getAttribute('UsoCFDI') ?? '',
    uuid: timbre?.getAttribute('UUID') ?? null,
    total: comprobante?.getAttribute('Total') ?? null,
    fecha: comprobante?.getAttribute('Fecha') ?? null,
    folio: comprobante?.getAttribute('Folio') ?? null,
  };
}
