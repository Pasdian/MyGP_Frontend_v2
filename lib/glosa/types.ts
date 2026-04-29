export type GlosaStatus =
  | 'Nueva'
  | 'En proceso'
  | 'En pausa'
  | 'En espera de cambios'
  | 'Aceptada'
  | 'Cerrada';

export type GlosaTipo = 'Importación' | 'Exportación';

export type Glosa = {
  id: string;
  ref: string;
  cliente: string;
  aduana: string;
  tipo: GlosaTipo;
  glosador: string;
  kam: string;
  status: GlosaStatus;
  errores: number;
  enviada: string; // 'YYYY-MM-DD HH:mm' display string
  tiempoQA: string; // 'Xh Ym' or '—'
  tiempoKAM: string;
  m: string;
  monto: string;
};

export type ErrorType =
  | 'Dato inexacto'
  | 'Documento incorrecto'
  | 'Incongruencia con documento';

export type GlosaError = {
  id: number;
  idx: number; // sequential 1..N for pin label
  file: string; // filename, e.g. 'PAE260036PD.pdf'
  page: number;
  x: number; // 0-100 % of doc width
  y: number;
  type: ErrorType;
  category: string; // free string from ERROR_CATEGORIES
  note: string;
  status: 'open' | 'resolved';
  createdAt: string;
};

export type ExpedienteRow = {
  key: string;
  label: string;
  required: boolean;
  file: string | null;
  size: string | null;
  uploaded: string | null;
  hint?: string;
};

export type Validacion = {
  field: string;
  pedimento: string;
  factura: string;
  ok: boolean;
  hint: string;
};

export type GlosadorLoad = {
  name: string;
  init: string;
  bg: string;
  capacity: number;
  inProgress: number;
  waiting: number;
  avgTime: string;
  errors30d: number;
  status?: string;
};

export type ViewerLayout = 'split' | 'single' | 'data' | 'errors' | 'validations';
export type ViewerRole = 'glosador' | 'kam' | 'admin';

export const ERROR_TYPES: ErrorType[] = [
  'Dato inexacto',
  'Documento incorrecto',
  'Incongruencia con documento',
];

export const ERROR_CATEGORIES = [
  'Valor factura vs pedimento',
  'Incoterm vs factura comercial',
  'RFCs',
  'Fecha de entrada',
  'Peso bruto / neto',
  'Fracción arancelaria',
  'País origen / destino',
  'Firma / sello de documento',
  'Otros',
] as const;
