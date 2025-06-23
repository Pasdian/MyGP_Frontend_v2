export const exceptionCodes = [
  {
    causaGlobal: 'DEMORAS EN PROCESO ADUANERO',
    causaPuntual: [
      { value: 'AA01', label: 'DEMORA EN LA SOLICITUD EN EL PAGO DE IMPUESTOS' },
      { value: 'AA02', label: 'DEMORA POR ERROR U OMISION' },
      { value: 'AA03', label: 'DEMORA POR PERDIDA O CONFUSION DE DOCUMENTOS' },
      { value: 'AA04', label: 'ERROR O RETRASO CERTIFICADO DE ORIGEN' },
      { value: 'AA05', label: 'DEMORA EN LA RADICACION DE LOS DOCUMENTOS ADUANALES' },
    ],
  },
  {
    causaGlobal: 'REQUISITOS ADICIONALES',
    causaPuntual: [{ value: 'AA06', label: 'DEMORA EN LA SOLICITUD DE REQUISITOS ADICIONALES' }],
  },
  {
    causaGlobal: 'DEMORA, CAMBIO O INSTRUCCIÓN ERRADA',
    causaPuntual: [
      {
        value: 'AL01',
        label: 'DETALLES DE RESERVA NO AJUSTABLES A LOS TIEMPOS O RUTA DEL RATE CARD',
      },
      { value: 'AL03', label: 'DEMORA O ERROR EN EL SUMINISTRO DE INSTRUCCIÓN' },
      { value: 'BC10', label: 'CAMBIO DE INSTRUCCION (FCL, LCL, AEREO, TERRESTRE, COURIER, MCC)' },
      { value: 'BC11', label: 'DEMORA EN EL SUMINISTRO DE INFORMACION' },
      { value: 'BC12', label: 'INSTRUCCIÓN ERRADA' },
      { value: 'FF13', label: 'REDUCCION DE CAPACITY' },
      { value: 'FF14', label: 'DEMORA EN EL SUMINISTRO DE INFORMACION' },
      { value: 'FF15', label: 'INSTRUCCIÓN ERRADA' },
      { value: 'FF16', label: 'DEMORAS POR ENVIO DE CARGA PARCIALIZADA' },
      { value: 'FF17', label: 'ERROR U OMISION POR PARTE DEL MEDIO TRANSPORTE' },
      {
        value: 'FF20',
        label: 'DETALLES DE RESERVA NO AJUSTABLES A LOS TIEMPOS O RUTA DEL RATE CARD',
      },
      { value: 'OL10', label: 'DEMORA EN EL SUMINISTRO DE INFORMACION' },
      { value: 'OL11', label: 'INSTRUCCIÓN ERRADA' },
      { value: 'OL12', label: 'ERROR U OMISION POR PARTE DEL MEDIO TRANSPORTE' },
      {
        value: 'OL15',
        label: 'DETALLES DE RESERVA NO AJUSTABLES A LOS TIEMPOS O RUTA DEL RATE CARD',
      },
      { value: 'PR10', label: 'DEMORA EN EL SUMINISTRO DE INFORMACION' },
      { value: 'PR11', label: 'INSTRUCCIÓN ERRADA' },
      { value: 'TL05', label: 'DEMORA EN EL SUMINISTRO DE INFORMACION' },
      { value: 'TL06', label: 'TIEMPO DE TRANSITO MAYOR A LO OFERTADO' },
    ],
  },
  {
    causaGlobal: 'DEMORA EN EL SUMINISTRO DE TARIFAS',
    causaPuntual: [
      { value: 'AL02', label: 'DEMORA EN LA COTIZACIÓN DE TARIFAS' },
      { value: 'BC01', label: 'DEMORA EN APROBACION DE TARIFAS' },
      { value: 'FF21', label: 'DEMORA EN CONFIRMACION DE TARIFAS' },
    ],
  },
  {
    causaGlobal: 'DEMORA EN CREACION DE EE',
    causaPuntual: [
      { value: 'AL04', label: 'SOLICITUD TARDIA EN LA EE (SCC)' },
      { value: 'AL05', label: 'CREACION TARDIA DE LA EE (COORDINADOR EE)' },
      { value: 'BC18', label: 'DEMORA EN LA ACTUALIZACION DE CANTIDADES' },
      { value: 'BC19', label: 'DEMORA EN LA ACTUALIZACION DE PRECIOS' },
      { value: 'BC20', label: 'DEMORA EN LA ACTUALIZACION DE CANTIDADES Y PRECIOS' },
      { value: 'BC21', label: 'INFORMACION INCOMPLETA EN SAP' },
      { value: 'BC22', label: 'CAMBIO DE PO LINES' },
      { value: 'FE30', label: 'FALLAS EN EL SISTEMA' },
      { value: 'PR01', label: 'DEMORA EN LA ACTUALIZACION DE CANTIDADES Y PRECIOS' },
    ],
  },
  {
    causaGlobal:
      'LLEGADA DE LA MERCANCIA POR FUERA DEL RANGO DE LA FECHA COMPROMISO DE ENTREGA A CDP',
    causaPuntual: [
      {
        value: 'AL06',
        label: 'LLEGADA DE LA MERCANCIA ANTES DE LA FECHA COMPROMISO DE ENTREGA EN CDP',
      },
      { value: 'BC24', label: 'CAMBIO DE FECHA REQUERIDA POSTERIOR AL ACUERDO INICIAL' },
      {
        value: 'FF22',
        label: 'LLEGADA DE LA MERCANCIA ANTES DE LA FECHA COMPROMISO DE ENTREGA EN CDP',
      },
    ],
  },
  {
    causaGlobal: 'CAMBIO DE FECHA DE PICK UP',
    causaPuntual: [
      {
        value: 'AL07',
        label: 'RECOGIDA DE LA CARGA ANTES O DESPUES DE LA FECHA CONFIRMADA POR EL PROVEEDOR',
      },
      {
        value: 'FF23',
        label: 'RECOGIDA DE LA CARGA ANTES O DESPUES DE LA FECHA CONFIRMADA POR EL PROVEEDOR',
      },
      {
        value: 'TL01',
        label: 'RECOGIDA DE LA CARGA ANTES O DESPUES DE LA FECHA CONFIRMADA POR EL BELCORP',
      },
    ],
  },
  {
    causaGlobal: 'RETRASO CONEXOS A LA OPERACIÓN',
    causaPuntual: [
      { value: 'BC02', label: 'DEMORAS POR CONSOLIDACION/DESCONSOLIDACION DE CARGA' },
      { value: 'FE01', label: 'DEMORAS POR CONSOLIDACION/DESCONSOLIDACION DE CARGA' },
      { value: 'FF19', label: 'DEMORAS POR CONSOLIDACION/DESCONSOLIDACION DE CARGA' },
      { value: 'OL13', label: 'DEMORAS POR CONSOLIDACION/DESCONSOLIDACION DE CARGA' },
    ],
  },
  {
    causaGlobal: 'RETRASO EN EL ENVIO DE DOCUMENTOS ORIGINALES',
    causaPuntual: [
      { value: 'BC03', label: 'FACTURAS / LISTA DE EMPAQUE' },
      { value: 'BC04', label: 'CARTAS DE RESPONSABILIDAD/NO APERTURA' },
      { value: 'BC05', label: 'OTROS DOCUMENTOS' },
      { value: 'BC25', label: 'CERTIFICADO DE ORIGEN' },
      {
        value: 'BC26',
        label:
          'OTROS DOCUMENTOS (CERTIFICADO DE CARGA PELIGROSA, CARTAS DE RESPONSABILIDAD, SLI, ETC)',
      },
      { value: 'FF03', label: 'FACTURAS / LISTA DE EMPAQUE' },
      { value: 'FF04', label: 'CERTIFICADO DE ORIGEN' },
      { value: 'FF05', label: 'FACTURAS Y/O CERTIFICACION DE FLETES' },
      { value: 'FF06', label: 'CERTIFICACION DE TRANSBORDO' },
      { value: 'FF07', label: 'DOCUMENTO DE TRANSPORTE' },
      { value: 'FF08', label: 'OTROS DOCUMENTOS' },
      { value: 'OL03', label: 'OTROS DOCUMENTOS' },
      { value: 'OL04', label: 'FACTURAS / LISTA DE EMPAQUE' },
      { value: 'OL05', label: 'FACTURAS Y/O CERTIFICACION DE FLETES' },
      { value: 'OL06', label: 'DOCUMENTO DE TRANSPORTE' },
      { value: 'PR04', label: 'FACTURAS COMERCIALES / LISTA DE EMPAQUE' },
      { value: 'PR05', label: 'CERTIFICADO DE ORIGEN' },
      {
        value: 'PR06',
        label:
          'OTROS DOCUMENTOS (CERTIFICADO DE CARGA PELIGROSA, CARTAS DE RESPONSABILIDAD, SLI, ETC)',
      },
      { value: 'TL07', label: 'DOCUMENTO DE TRANSPORTE' },
      { value: 'TL10', label: 'DOCUMENTO DE TRANSPORTE' },
    ],
  },
  {
    causaGlobal: 'DOCUMENTOS ORIGINALES CON INFORMACION ERRADA',
    causaPuntual: [
      { value: 'BC06', label: 'FACTURAS / LISTA DE EMPAQUE' },
      { value: 'BC07', label: 'CERTIFICADO DE ORIGEN' },
      { value: 'BC08', label: 'CARTAS DE RESPONSABILIDAD/NO APERTURA' },
      { value: 'BC09', label: 'OTROS DOCUMENTOS' },
      {
        value: 'BC27',
        label:
          'OTROS DOCUMENTOS (CERTIFICADO DE CARGA PELIGROSA, CARTAS DE RESPONSABILIDAD, SLI, ETC)',
      },
      { value: 'FF09', label: 'FACTURAS Y/O CERTIFICACION DE FLETES' },
      { value: 'FF10', label: 'CERTIFICACION DE TRANSBORDO' },
      { value: 'FF11', label: 'DOCUMENTO DE TRANSPORTE' },
      { value: 'FF12', label: 'OTROS DOCUMENTOS' },
      { value: 'OL07', label: 'FACTURAS Y/O CERTIFICACION DE FLETES' },
      { value: 'OL08', label: 'DOCUMENTO DE TRANSPORTE' },
      { value: 'OL09', label: 'OTROS DOCUMENTOS' },
      {
        value: 'PR07',
        label: 'FACTURAS COMERCIALES / LISTA DE EMPAQUE (CANTIDADES, PRECIOS, CONSECUTIVO, ETC)',
      },
      { value: 'PR08', label: 'CERTIFICADO DE ORIGEN' },
      {
        value: 'PR09',
        label:
          'OTROS DOCUMENTOS (CERTIFICADO DE CARGA PELIGROSA, CARTAS DE RESPONSABILIDAD, SLI, ETC)',
      },
      { value: 'TL08', label: 'DOCUMENTO DE TRANSPORTE' },
      { value: 'TL09', label: 'OTROS DOCUMENTOS' },
    ],
  },
  {
    causaGlobal: 'CAMBIO EN EL ENVIO DE DOCUMENTOS COMERCIALES',
    causaPuntual: [
      {
        value: 'BC13',
        label: 'GRUPO FACTURADO ANTES O DESPUES DE LA FECHA INFORMADA EN LA INSTRUCCIÓN',
      },
    ],
  },
  {
    causaGlobal: 'NO RECEPCION Y/O DEMORA EN LA RECEPCION DE LA CARGA EN EL CPAC/CDP',
    causaPuntual: [
      { value: 'BC14', label: 'FALTA DE DISPONIBILIDAD DE ESPACIO EN CPAC/CDP' },
      { value: 'BC15', label: 'PRIORIZACION EN ADUANA O ENTREGA POR PARTE DE BELCORP' },
    ],
  },
  {
    causaGlobal: 'OTRAS DEMORAS',
    causaPuntual: [
      { value: 'BC16', label: 'DEMORA EN EL PAGO DE IMPUESTOS' },
      { value: 'BC17', label: 'EXCESO DE CAPACITY SOBRE EL NEGOCIADO' },
      { value: 'FE02', label: 'EXCESO DE CAPACITY SOBRE EL NEGOCIADO' },
    ],
  },
  {
    causaGlobal: 'PROBLEMAS CON LA MERCANCÍA',
    causaPuntual: [
      { value: 'BC23', label: 'LA CARGA NO ESTA LISTA Y/O ESTA EN MAL ESTADO' },
      { value: 'BC29', label: 'CARGA MAL ETIQUETADA' },
      { value: 'FF01', label: 'DAÑOS, AVERIAS, ABOLLADURAS O GOLPES DE LA CARGA' },
      { value: 'FF02', label: 'PERDIDA PARCIAL O TOTAL DE LA MERCANCIA (ROBO)' },
      { value: 'OL01', label: 'DAÑOS, AVERIAS, ABOLLADURAS O GOLPES DE LA CARGA' },
      { value: 'OL02', label: 'PERDIDA PARCIAL O TOTAL DE LA MERCANCIA (ROBO)' },
      { value: 'PR02', label: 'EMBALAJE NO APROPIADO' },
      { value: 'PR03', label: 'CARGA MAL ETIQUETADA' },
    ],
  },
  {
    causaGlobal: 'FERIADO EN CUALQUIER PROCESO DE LOGISTICA',
    causaPuntual: [
      { value: 'BC28', label: 'FERIADO O DIA NO LABORAL EN PAIS' },
      { value: 'FE24', label: 'FERIADO O DIA NO LABORAL EN PAIS' },
    ],
  },
  {
    causaGlobal:
      'DEMORAS EN PROCESOS GUBERNAMENTALES (INSPECCION FISICA, INSPECCION POR PERFILAMIENTO, BOLETIN QUIMICO, ETC)',
    causaPuntual: [
      { value: 'FE03', label: 'CANAL ROJO (INSPECCION FISICA)' },
      { value: 'FE04', label: 'BOLETIN QUIMICO' },
      { value: 'FE05', label: 'PERFILAMIENTO (INSPECCION DISTINTA A LA ENTIDAD ADUANAL)' },
      { value: 'FE06', label: 'FALLA EN EL SISTEMA DE LA ENTIDAD ADUANAL' },
      { value: 'FE07', label: 'CAMBIOS EN LEYES GUBERNAMENTALES' },
      { value: 'FE08', label: 'SOLICITUD REQUERIMIENTOS ADICIONALES' },
    ],
  },
  {
    causaGlobal: 'NO RECALADA DE LA MOTONAVE',
    causaPuntual: [
      { value: 'FE09', label: 'NO RECALADA POR INCUMPLIMIENTO DE ITINERARIOS' },
      { value: 'FE10', label: 'AVERIA GRUESA' },
    ],
  },
  {
    causaGlobal: 'RETRASO DEL MEDIO DE TRANSPORTE',
    causaPuntual: [
      { value: 'FE11', label: 'DEMORAS POR PESO Y BALANCE' },
      { value: 'FF18', label: 'REDUCCION DE CAPACITY //FALTA O RESTRICCION DE ESPACIOS (BACKLOG)' },
    ],
  },
  {
    causaGlobal: 'DEMORA EN APROBACION DE VISTOS BUENOS',
    causaPuntual: [
      { value: 'FE12', label: 'DEMORA POR INEN' },
      { value: 'FE13', label: 'DEMORA POR INVIMA' },
      { value: 'FE14', label: 'DEMORA POR ANVISA' },
      { value: 'FE15', label: 'DEMORA POR REGISTRO DE IMPORTACION' },
      { value: 'FE16', label: 'DEMORA POR OTROS VISTOS BUENOS' },
      { value: 'FE17', label: 'DEMORA POR AGEMED' },
    ],
  },
  {
    causaGlobal: 'FACTORES QUE IMPIDEN Ó DEMORAN EL TRANSITO DEL EMBARQUE',
    causaPuntual: [
      { value: 'FE18', label: 'FACTORES CLIMATICOS' },
      { value: 'FE19', label: 'FALLAS MECANICAS Y/O ACCIDENTE EN LOS MEDIOS DE TRANSPORTE' },
      { value: 'FE20', label: 'HUELGAS, ASONADAS, PAROS Ó BLOQUEOS (RESTRICCION VEHICULAR)' },
      { value: 'FE21', label: 'CONGESTION EN PUERTO Ó AEROPUERTO' },
      {
        value: 'FE22',
        label:
          'RESTRICCION DE LA AEROLINEA O LINEA NAVIERA PARA EL EMBARQUE DE LA M/CIA POR COMPATIBILIDAD DE IMOS',
      },
      { value: 'FE25', label: 'FECHA DE COMPROMISO DEL PROVEEDOR VS FECHA DE CUT OFF REAL' },
      {
        value: 'FE29',
        label: 'IMPOSIBILIDAD PARA EL CARGUE EL MISMO DIA POR RESTRICCION DEL DEPOSITO/PUERTO',
      },
    ],
  },
  {
    causaGlobal: 'CONGESTION PORTUARIA PARA TRANSPORTADORES',
    causaPuntual: [{ value: 'FE23', label: 'DEMORA EN LA ASIGNACION DE CITAS PARA CARGUE' }],
  },
  {
    causaGlobal: 'DEMORAS EN CONEXIÓN',
    causaPuntual: [
      { value: 'FE26', label: 'RETRASO POR CONGESTION EN PUERTOS DE CONEXIÓN ANTERIORES' },
    ],
  },
  {
    causaGlobal: 'INSPECCION EN CONEXIÓN',
    causaPuntual: [
      { value: 'FE27', label: 'RETRASO POR INSPECCION EN PUERTOS DE CONEXIÓN ANTERIORES' },
    ],
  },
  {
    causaGlobal: 'RESTRICCION DEL MERCADO',
    causaPuntual: [{ value: 'FE28', label: 'REDUCCION DE ESPACIO POR COYUNYURA DEL MERCADO' }],
  },
  {
    causaGlobal: 'CAPACIDAD DE LA CONEXIÓN',
    causaPuntual: [
      { value: 'FF25', label: 'CAPACIDAD DE LA CONEXIÓN MENOR A LA DEL PRIMER TRAMO' },
    ],
  },
  {
    causaGlobal: 'DISPONIBILIDAD DE VEHICULOS',
    causaPuntual: [
      { value: 'FF24', label: 'DEMORA EN LA ASIGNACION DE VEHICULOS' },
      { value: 'OL14', label: 'DEMORA EN LA ASIGNACION DE VEHICULOS' },
      { value: 'TL02', label: 'DEMORA EN LA ASIGNACION DE VEHICULOS EN ORIGEN' },
      { value: 'TL03', label: 'DEMORA EN LA ASIGNACION DE VEHICULOS EN DESTINO' },
    ],
  },
  {
    causaGlobal: 'CONDICIONES DE VEHICULO',
    causaPuntual: [
      { value: 'TL04', label: 'VEHICULOS QUE NO CUMPLEN CON LOS REQUISITOS DE BELCORP' },
    ],
  },
  {
    causaGlobal: 'CAMBIO Y/O DEMORA EN EL PICK UP DATE O SHIPMENT RECEIVED',
    causaPuntual: [
      { value: 'PR12', label: 'ENTREGA DE LA CARGA DESPUES DEL CUT OFF' },
      { value: 'PR13', label: 'ENTREGA DE LA CARGA ANTES DEL CUT OFF' },
    ],
  },
  {
    causaGlobal: 'DEMORAS EN LA ENTREGA DE MERCANCIA',
    causaPuntual: [
      {
        value: 'PR14',
        label: 'EL PROVEEDOR ENTREGA LA MERCANCIA DESPUES DE LA FECHA DE COMPROMISO',
      },
      { value: 'PR15', label: 'EL PROVEEDOR ENTREGA LA MERCANCIA ANTES DE LA FECHA DE COMPROMISO' },
    ],
  },
  {
    causaGlobal: 'DEMORAS EN LA LIBERACION DE DOCUMENTOS',
    causaPuntual: [{ value: 'PR16', label: 'DEMORA DE PAGOS EN ORIGEN' }],
  },
];
