import { z } from 'zod/v4';
import { buildHaciendaSchema, createPdfSchema } from './utilSchema';
import { createImagesSchema } from './datosContactoSchema';

export const EXP_DIGI_SCHEMAS = {
  'imp.docs': z.object({
    actaConstitutiva: z
      .object({
        docKey: z.literal('imp.legal.acta'),
        file: createPdfSchema(30_000_000),
      })
      .optional(),
    poderNotarial: z
      .object({
        docKey: z.literal('imp.legal.poder'),
        file: createPdfSchema(30_000_000),
      })
      .optional(),
  }),

  'imp.contact': z.object({
    comprobanteDomicilio: z
      .object({
        docKey: z.literal('imp.contact.domicilio'),
        file: createPdfSchema(5_000_000),
      })
      .optional(),

    fotosDomicilioFiscal: z
      .object({
        docKey: z.literal('imp.contact.fotos_fiscal'),
        files: createImagesSchema(50_000_000, 10),
      })
      .optional(),

    fotosAcreditacionLegalInmueble: z
      .object({
        docKey: z.literal('imp.contact.fotos_inmueble'),
        files: createImagesSchema(50_000_000, 10),
      })
      .optional(),

    fotosLugarActividades: z
      .object({
        docKey: z.literal('imp.contact.fotos_actividades'),
        files: createImagesSchema(50_000_000, 10),
      })
      .optional(),
  }),
  'imp.tax': buildHaciendaSchema(2_000_000, 2_000_000, 2_000_000),
};

export const EXP_DIGI_DEFAULT_VALUES = {
  'imp.docs': {
    actaConstitutiva: { docKey: 'imp.legal.acta', file: undefined },
    poderNotarial: { docKey: 'imp.legal.poder', file: undefined },
  },
  'imp.contact': {
    comprobanteDomicilio: { docKey: 'imp.contact.domicilio', file: undefined },
    fotosDomicilioFiscal: { docKey: 'imp.contact.fotos_fiscal', files: [] },
    fotosAcreditacionLegalInmueble: { docKey: 'imp.contact.fotos_inmueble', files: [] },
    fotosLugarActividades: { docKey: 'imp.contact.fotos_actividades', files: [] },
  },
  'imp.tax': {
    certificado: {
      docKey: 'imp.tax.cert',
      file: undefined,
    },
    efirma: {
      docKey: 'imp.tax.efirma',
      file: undefined,
    },
    constancia: {
      docKey: 'imp.tax.constancia',
      file: undefined,
    },
  },
} as const satisfies Record<string, unknown>;
