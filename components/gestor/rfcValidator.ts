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
};

function normalizeXmlName(value: string | null | undefined): string {
  return (value ?? '').split(':').pop()?.trim().toLowerCase() ?? '';
}

function getFirstElementByLocalName(doc: Document, localName: string): Element | null {
  const expectedName = localName.trim().toLowerCase();

  const namespacedMatch = doc.getElementsByTagNameNS('*', localName)[0];
  if (namespacedMatch) {
    return namespacedMatch;
  }

  if (normalizeXmlName(doc.documentElement?.localName) === expectedName) {
    return doc.documentElement;
  }

  return (
    Array.from(doc.getElementsByTagName('*')).find((element) => {
      return (
        normalizeXmlName(element.localName) === expectedName ||
        normalizeXmlName(element.tagName) === expectedName ||
        normalizeXmlName(element.nodeName) === expectedName
      );
    }) ?? null
  );
}

function getAttributeCaseInsensitive(element: Element | null, attributeName: string): string | null {
  if (!element) {
    return null;
  }

  const directValue = element.getAttribute(attributeName);
  if (directValue !== null) {
    return directValue;
  }

  const expectedName = attributeName.trim().toLowerCase();
  return (
    Array.from(element.attributes).find((attribute) => attribute.name.trim().toLowerCase() === expectedName)
      ?.value ?? null
  );
}

function getTagAttributesFromXmlText(xmlText: string, tagName: string): string {
  const tagPattern = new RegExp(`<(?:[\\w.-]+:)?${tagName}\\b([^>]*)>`, 'i');
  return xmlText.match(tagPattern)?.[1] ?? '';
}

function getAttributeFromRawTag(rawAttributes: string, attributeName: string): string | null {
  const attributePattern = new RegExp(`\\b${attributeName}\\s*=\\s*["']([^"']*)["']`, 'i');
  return rawAttributes.match(attributePattern)?.[1] ?? null;
}

export function parseCfdiXml(xmlText: string): ParsedCfdi {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  // Detect parse errors
  const parseError = doc.getElementsByTagName('parsererror')[0];
  if (parseError) throw new Error('XML inválido');

  const comprobante = getFirstElementByLocalName(doc, 'Comprobante');
  const receptor = getFirstElementByLocalName(doc, 'Receptor');
  const timbre = getFirstElementByLocalName(doc, 'TimbreFiscalDigital');
  const rawComprobante = getTagAttributesFromXmlText(xmlText, 'Comprobante');
  const rawReceptor = getTagAttributesFromXmlText(xmlText, 'Receptor');
  const rawTimbre = getTagAttributesFromXmlText(xmlText, 'TimbreFiscalDigital');

  const receptorRfc =
    getAttributeCaseInsensitive(receptor, 'Rfc') ?? getAttributeFromRawTag(rawReceptor, 'Rfc') ?? '';

  return {
    receptorRfc,
    receptorNombre:
      getAttributeCaseInsensitive(receptor, 'Nombre') ?? getAttributeFromRawTag(rawReceptor, 'Nombre') ?? '',
    usoCfdi:
      getAttributeCaseInsensitive(receptor, 'UsoCFDI') ?? getAttributeFromRawTag(rawReceptor, 'UsoCFDI') ?? '',
    uuid: getAttributeCaseInsensitive(timbre, 'UUID') ?? getAttributeFromRawTag(rawTimbre, 'UUID') ?? null,
    total:
      getAttributeCaseInsensitive(comprobante, 'Total') ?? getAttributeFromRawTag(rawComprobante, 'Total') ?? null,
    fecha:
      getAttributeCaseInsensitive(comprobante, 'Fecha') ?? getAttributeFromRawTag(rawComprobante, 'Fecha') ?? null,
  };
}
