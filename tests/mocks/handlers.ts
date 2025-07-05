import { http, HttpResponse } from 'msw';
import dotenv from 'dotenv';
dotenv.config();

// Intercept requests
export const handlers = [
  http.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transbel/getDeliveries`, () => {
    return HttpResponse.json([
      {
        REFERENCIA: 'PAE251806',
        EE__GE: '977183',
        GUIA_HOUSE: 'EDC1315924',
        ENTREGA_TRANSPORTE_138: '2025-07-02 14:01:00.0000 ',
        CE_138: '',
        ENTREGA_CDP_140: '2025-07-03 13:02:00.0000 ',
        CE_140: '',
      },
      {
        REFERENCIA: 'PAE251807',
        EE__GE: '976573, 976575',
        GUIA_HOUSE: 'EDC1313986',
        ENTREGA_TRANSPORTE_138: '2025-06-20 14:01:00.0000 ',
        CE_138: '',
        ENTREGA_CDP_140: '2025-07-04 13:29:00.0000 ',
        CE_140: '',
      },
    ]);
  }),
  http.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transbel/upsertPhase`, () => {
    return HttpResponse.json([
      {
        message: 'Datos modificados correctamente',
      },
    ]);
  }),
];
