export const PATHS = {
  DOCUMENTOS_IMPORTADOR_EXPORTADOR: {
    base: "Documentos del Importador y_o Exportador",
    subfolders: {
      DOCUMENTOS_IMPORTADOR: "Documentos del Importador",
      DATOS_CONTACTO_DEL_IMPORTADOR: "Datos de Contacto del Importador",
      DATOS_HACIENDA_IMPORTADOR: "Datos de Hacienda del Importador",
      DATOS_REPRESENTANTE_LEGAL: "Datos del Representante Legal",
      MANIFIESTO_BAJO_PROTESTA: "Manifiesto Bajo Protesta",
      DOCUMENTOS_ACREDITA_AGENTE_ADUANAL:
        "Documentos que acredita el Agente Aduanal",
      DATOS_HACIENDA_AGENTE_ADUANAL: "Datos de Hacienda del Agente Aduanal",
    },
  },
  DOCUMENTOS_AREA_COMERCIAL: {
    base: "Documentos del Area Comercial",
    subfolders: {
      CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD:
        "Cartas Encomienda y Aviso de Privacidad",
      ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL:
        "Acuerdo Confidencialidad y Socio Comercial",
      TARIFAS: "Tarifas",
    },
  },
  DOCUMENTOS_COMPLEMENTARIOS: {
    base: "Documentos Complementarios",
  },
  DOCUMENTOS_ACTIVIDAD_VULNERABLE: {
    base: "Documentos para Importadores_Exportadores con Actividad Vulnerable",
  },
} as const;
