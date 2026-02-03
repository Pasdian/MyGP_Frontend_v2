import { z } from 'zod/v4';
import { buildHaciendaSchema, createPdfSchema } from './utilSchema';
import { createImagesSchema } from './datosContactoSchema';
import { buildRepresentanteSchema } from './representanteSchema';

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

  'imp.rep': buildRepresentanteSchema(2_000_000),

  'imp.man': z
    .object({
      usuarioSolicitoOperacion: z.object({
        isChecked: z.boolean(),
        file: z.object({
          docKey: z.literal('man.usuario'),
          file: createPdfSchema(2_000_000).optional(),
        }),
      }),
      agenteAduanalVerificoUsuarios: z.object({
        isChecked: z.boolean(),
        file: z.object({
          docKey: z.literal('man.agente'),
          file: createPdfSchema(2_000_000).optional(),
        }),
      }),
    })
    .superRefine((val, ctx) => {
      if (!val.usuarioSolicitoOperacion.isChecked) {
        ctx.addIssue({
          code: 'custom',
          path: ['usuarioSolicitoOperacion', 'isChecked'],
          message: 'Debes marcar esta casilla.',
        });
      } else if (!val.usuarioSolicitoOperacion.file?.file) {
        ctx.addIssue({
          code: 'custom',
          path: ['usuarioSolicitoOperacion', 'file', 'file'],
          message: 'Adjunta el archivo en PDF.',
        });
      }

      if (!val.agenteAduanalVerificoUsuarios.isChecked) {
        ctx.addIssue({
          code: 'custom',
          path: ['agenteAduanalVerificoUsuarios', 'isChecked'],
          message: 'Debes marcar esta casilla.',
        });
      } else if (!val.agenteAduanalVerificoUsuarios.file?.file) {
        ctx.addIssue({
          code: 'custom',
          path: ['agenteAduanalVerificoUsuarios', 'file', 'file'],
          message: 'Adjunta el archivo en PDF.',
        });
      }
    }),

  'imp.acre': z.object({
    obligacionesFiscales: z
      .object({
        docKey: z.literal('acre.legal.opinion'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    datosBancarios: z
      .object({
        docKey: z.literal('acre.legal.banco'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
    datosBancariosExp: z.string().optional(),

    conferidoJosePascal: z
      .object({
        docKey: z.literal('acre.legal.encargo_jpc'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
    conferidoJosePascalExp: z.string().optional(),

    conferidoMarcoBremer: z
      .object({
        docKey: z.literal('acre.legal.encargo_mbg'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
    conferidoMarcoBremerExp: z.string().optional(),
  }),

  'imp.agent.tax': buildHaciendaSchema(2_000_000, 2_000_000, 2_000_000),

  'com.encomienda': z.object({
    cartaEncomienda3901: z
      .object({
        docKey: z.literal('com.encomienda.3901'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    cartaEncomienda3072: z
      .object({
        docKey: z.literal('com.encomienda.3072'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    avisoPrivacidad: z
      .object({
        docKey: z.literal('com.privacidad'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
  }),

  'com.conf': z.object({
    acuerdoConfidencialidad: z
      .object({
        docKey: z.literal('com.acuerdo.conf'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    acuerdoSocioComercial: z
      .object({
        docKey: z.literal('com.acuerdo.socio'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
  }),

  'com.tarifas': z.object({
    tarifaAutorizada: z
      .object({
        docKey: z.literal('com.tarifa.aut'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    tarifaPreferencial: z
      .object({
        docKey: z.literal('com.tarifa.pre'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    tarifaUSA: z
      .object({
        docKey: z.literal('com.tarifa.usa'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
  }),

  'cmp.docs': z.object({
    cuestionarioLavadoTerrorismo: z
      .object({
        docKey: z.literal('cmp.pld'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    altaClientes: z
      .object({
        docKey: z.literal('cmp.alta'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    listaClinton: z
      .object({
        docKey: z.literal('cmp.clinton'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
  }),

  'vuln.docs': z.object({
    formatoActividadVulnerable3901: z
      .object({
        docKey: z.literal('vul.act.3901'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    formatoActividadVulnerable3072: z
      .object({
        docKey: z.literal('vul.act.3072'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    formatoDuenioBeneficiario3901: z
      .object({
        docKey: z.literal('vul.benef.3901'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    formatoDuenioBeneficiario3072: z
      .object({
        docKey: z.literal('vul.benef.3072'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    constanciaHojaMembretada3901: z
      .object({
        docKey: z.literal('vul.lfpiorpi.3901'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),

    constanciaHojaMembretada3072: z
      .object({
        docKey: z.literal('vul.lfpiorpi.3072'),
        file: createPdfSchema(2_000_000),
      })
      .optional(),
  }),
} as const;

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
    certificado: { docKey: 'imp.tax.cert', file: undefined },
    efirma: { docKey: 'imp.tax.efirma', file: undefined },
    constancia: { docKey: 'imp.tax.constancia', file: undefined },
  },

  'imp.rep': {
    nombre: '',
    apellido1: '',
    apellido2: '',
    rfc: '',
    curp: '',
    address_1: '',
    neighbourhood: '',
    municipality: '',
    city: '',
    state: '',
    postal_code: '',
    correoElectronico: '',
    numeroOficina: '',
    telefonoRepresentanteLegal: '',
    ineExp: '',
    ine: {
      docKey: 'rep.ine',
      file: undefined,
    },
  },

  'imp.man': {
    usuarioSolicitoOperacion: {
      docKey: 'man.usuario',
      file: undefined,
    },
    agenteAduanalVerificoUsuarios: {
      docKey: 'man.agente',
      file: undefined,
    },
  },

  'imp.acre': {
    obligacionesFiscales: { docKey: 'acre.legal.opinion', file: undefined },
    datosBancarios: { docKey: 'acre.legal.banco', file: undefined },
    datosBancariosExp: '',
    conferidoJosePascal: { docKey: 'acre.legal.encargo_jpc', file: undefined },
    conferidoJosePascalExp: '',
    conferidoMarcoBremer: { docKey: 'acre.legal.encargo_mbg', file: undefined },
    conferidoMarcoBremerExp: '',
  },

  'imp.agent.tax': {
    certificado: { docKey: 'agent.tax.cert', file: undefined },
    efirma: { docKey: 'agent.tax.efirma', file: undefined },
    constancia: { docKey: 'agent.tax.constancia', file: undefined },
  },

  'com.encomienda': {
    cartaEncomienda3901: { docKey: 'com.encomienda.3901', file: undefined },
    cartaEncomienda3072: { docKey: 'com.encomienda.3072', file: undefined },
    avisoPrivacidad: { docKey: 'com.privacidad', file: undefined },
  },

  'com.conf': {
    acuerdoConfidencialidad: { docKey: 'com.acuerdo.conf', file: undefined },
    acuerdoSocioComercial: { docKey: 'com.acuerdo.socio', file: undefined },
  },

  'com.tarifas': {
    tarifaAutorizada: { docKey: 'com.tarifa.aut', file: undefined },
    tarifaPreferencial: { docKey: 'com.tarifa.pre', file: undefined },
    tarifaUSA: { docKey: 'com.tarifa.usa', file: undefined },
  },

  'cmp.docs': {
    cuestionarioLavadoTerrorismo: { docKey: 'cmp.pld', file: undefined },
    altaClientes: { docKey: 'cmp.alta', file: undefined },
    listaClinton: { docKey: 'cmp.clinton', file: undefined },
  },

  'vuln.docs': {
    formatoActividadVulnerable3901: { docKey: 'vul.act.3901', file: undefined },
    formatoActividadVulnerable3072: { docKey: 'vul.act.3072', file: undefined },
    formatoDuenioBeneficiario3901: { docKey: 'vul.benef.3901', file: undefined },
    formatoDuenioBeneficiario3072: { docKey: 'vul.benef.3072', file: undefined },
    constanciaHojaMembretada3901: { docKey: 'vul.lfpiorpi.3901', file: undefined },
    constanciaHojaMembretada3072: { docKey: 'vul.lfpiorpi.3072', file: undefined },
  },
} as const satisfies Record<string, unknown>;
