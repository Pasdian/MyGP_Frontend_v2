type DocTemplate = {
  filename: string;
  size: number;
};

type Doc = DocTemplate & {
  category: number;
};

type FolderNodeTemplate = {
  name: string;
  docs?: Record<string, DocTemplate>;
  children?: Record<string, FolderNodeTemplate>;
};

type FolderNode = {
  name: string;
  docs?: Record<string, Doc>;
  children?: Record<string, FolderNode>;
};

export const FOLDERFILESTRUCT_TEMPLATE = {
  DOCUMENTOS_IMPORTADOR_EXPORTADOR: {
    name: "Documentos del Importador y_o Exportador",
    children: {
      DOCUMENTOS_IMPORTADOR: {
        name: "Documentos del Importador",
        docs: {
          ACTA_CONSTITUTIVA: {
            filename: "ACTA_CONSTITUTIVA.pdf",
            size: 30_000_000,
          },
          PODER_NOTARIAL: {
            filename: "PODER_NOTARIAL.pdf",
            size: 30_000_000,
          },
        },
      },
      DATOS_CONTACTO_DEL_IMPORTADOR: {
        name: "Datos de Contacto del Importador",
        docs: {
          COMPROBANTE_DE_DOMICILIO: {
            filename: "COMPROBANTE_DE_DOMICILIO.pdf",
            size: 5_000_000,
          },
          FOTOS_DOMICILIO_FISCAL: {
            filename: "FOTOS_DOMICILIO_FISCAL.pdf",
            size: 50_000_000,
          },
          FOTOS_ACREDITACION_LEGAL_INMUEBLE: {
            filename: "FOTOS_ACREDITACION_LEGAL_INMUEBLE.pdf",
            size: 50_000_000,
          },
          FOTOS_LUGAR_ACTIVIDADES: {
            filename: "FOTOS_LUGAR_ACTIVIDADES.pdf",
            size: 50_000_000,
          },
        },
      },
      DATOS_HACIENDA_IMPORTADOR: {
        name: "Datos de Hacienda del Importador",
        docs: {
          CERTIFICADO_SAT: { filename: "CERTIFICADO_SAT.cer", size: 5_000_000 },
          EFIRMA_SAT: { filename: "EFIRMA_SAT.key", size: 5_000_000 },
          CONSTANCIA_SITUACION_FISCAL_SAT: {
            filename: "CONSTANCIA_SITUACION_FISCAL_SAT.pdf",
            size: 5_000_000,
          },
        },
      },
      DOCUMENTOS_REPRESENTANTE_LEGAL: {
        name: "Documentos del Representante Legal",
        docs: { INE: { filename: "INE.pdf", size: 5_000_000 } },
      },
      MANIFIESTO_BAJO_PROTESTA: {
        name: "Manifiesto Bajo Protesta",
        docs: {
          USUARIO_SOLICITO_OPERACION: {
            filename: "USUARIO_SOLICITO_OPERACION.pdf",
            size: 5_000_000,
          },
          AGENTE_ADUANAL_VERIFICO_USUARIOS: {
            filename: "AGENTE_ADUANAL_VERIFICO_USUARIOS.pdf",
            size: 5_000_000,
          },
        },
      },
      DOCUMENTOS_ACREDITA_AGENTE_ADUANAL: {
        name: "Documentos que acredita el Agente Aduanal",
        docs: {
          OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES: {
            filename: "OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.pdf",
            size: 5_000_000,
          },
          DATOS_BANCARIOS_HOJA_MEMBRETADA: {
            filename: "DATOS_BANCARIOS_HOJA_MEMBRETADA.pdf",
            size: 5_000_000,
          },
          ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO: {
            filename: "ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.pdf",
            size: 5_000_000,
          },
          ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA: {
            filename: "ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.pdf",
            size: 5_000_000,
          },
        },
      },
      DATOS_HACIENDA_AGENTE_ADUANAL: {
        name: "Datos de Hacienda del Agente Aduanal",
        docs: {
          CERTIFICADO_SAT: { filename: "CERTIFICADO_SAT.cer", size: 5_000_000 },
          EFIRMA_SAT: { filename: "EFIRMA_SAT.key", size: 5_000_000 },
          CONSTANCIA_SITUACION_FISCAL_SAT: {
            filename: "CONSTANCIA_SITUACION_FISCAL_SAT.pdf",
            size: 5_000_000,
          },
        },
      },
    },
  },

  DOCUMENTOS_AREA_COMERCIAL: {
    name: "Documentos del Área Comercial",
    children: {
      CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD: {
        name: "Cartas Encomienda y Aviso de Privacidad",
        docs: {
          CARTA_ENCOMIENDA_3901: {
            filename: "CARTA_ENCOMIENDA_3901.pdf",
            size: 5_000_000,
          },
          CARTA_ENCOMIENDA_3072: {
            filename: "CARTA_ENCOMIENDA_3072.pdf",
            size: 5_000_000,
          },
          AVISO_PRIVACIDAD: {
            filename: "AVISO_PRIVACIDAD.pdf",
            size: 5_000_000,
          },
        },
      },
      ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL: {
        name: "Acuerdo Confidencialidad y Socio Comercial",
        docs: {
          ACUERDO_CONFIDENCIALIDAD: {
            filename: "ACUERDO_CONFIDENCIALIDAD.pdf",
            size: 5_000_000,
          },
          ACUERDO_SOCIO_COMERCIAL: {
            filename: "ACUERDO_SOCIO_COMERCIAL.pdf",
            size: 5_000_000,
          },
        },
      },
      TARIFAS: {
        name: "Tarifas",
        docs: {
          TARIFA_AUTORIZADA: {
            filename: "TARIFA_AUTORIZADA.pdf",
            size: 5_000_000,
          },
          TARIFA_PRECLASIFICACION: {
            filename: "TARIFA_PRECLASIFICACION.pdf",
            size: 5_000_000,
          },
          TARIFA_AMERICANA: {
            filename: "TARIFA_AMERICANA.pdf",
            size: 5_000_000,
          },
        },
      },
    },
  },

  DOCUMENTOS_COMPLEMENTARIOS: {
    name: "Documentos Complementarios",
    docs: {
      CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS: {
        filename: "CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.pdf",
        size: 5_000_000,
      },
      ALTA_CLIENTES: { filename: "ALTA_CLIENTES.pdf", size: 5_000_000 },
      LISTA_CLINTON: { filename: "LISTA_CLINTON.pdf", size: 5_000_000 },
    },
  },

  DOCUMENTOS_ACTIVIDAD_VULNERABLE: {
    name: "Documentos para Importadores_Exportadores con Actividad Vulnerable",
    docs: {
      FORMATO_ACTIVIDAD_VULNERABLE_3901: {
        filename: "FORMATO_ACTIVIDAD_VULNERABLE_3901.pdf",
        size: 5_000_000,
      },
      FORMATO_ACTIVIDAD_VULNERABLE_3072: {
        filename: "FORMATO_ACTIVIDAD_VULNERABLE_3072.pdf",
        size: 5_000_000,
      },
      FORMATO_DUEÑO_BENEFICIARIO_3901: {
        filename: "FORMATO_DUEÑO_BENEFICIARIO_3901.pdf",
        size: 5_000_000,
      },
      FORMATO_DUEÑO_BENEFICIARIO_3072: {
        filename: "FORMATO_DUEÑO_BENEFICIARIO_3072.pdf",
        size: 5_000_000,
      },
      LFPIORPI_HOJA_MEMBRETADA_3901: {
        filename: "LFPIORPI_HOJA_MEMBRETADA_3901.pdf",
        size: 5_000_000,
      },
      LFPIORPI_HOJA_MEMBRETADA_3072: {
        filename: "LFPIORPI_HOJA_MEMBRETADA_3072.pdf",
        size: 5_000_000,
      },
    },
  },
} satisfies Record<string, FolderNodeTemplate>;

function assignCategories(
  tree: Record<string, FolderNodeTemplate>,
  start = 1,
): Record<string, FolderNode> {
  let counter = start;

  const walk = (node: FolderNodeTemplate): FolderNode => {
    const docs = node.docs
      ? Object.fromEntries(
          Object.entries(node.docs).map(([key, doc]) => [
            key,
            { ...doc, category: counter++ },
          ]),
        )
      : undefined;

    const children = node.children
      ? Object.fromEntries(
          Object.entries(node.children).map(([key, child]) => [
            key,
            walk(child),
          ]),
        )
      : undefined;

    return { ...node, docs, children };
  };

  return Object.fromEntries(
    Object.entries(tree).map(([key, node]) => [key, walk(node)]),
  );
}

export const FOLDERFILESTRUCT = assignCategories(FOLDERFILESTRUCT_TEMPLATE);
