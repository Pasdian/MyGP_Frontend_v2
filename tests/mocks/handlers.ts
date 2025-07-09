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
  http.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`, () => {
    return HttpResponse.json([
      {
        id: 1,
        uuid: 'a7b242f2-7c96-49bf-a428-0e345e08cc49',
        name: 'Admin Role',
        description: 'Administrator with full access',
        created_at: '2025-03-03T17:21:08.410Z',
        updated_at: '2025-07-07T23:14:32.197Z',
      },
      {
        id: 17,
        uuid: '68d6cd1c-ba19-4755-974c-3b32afc1187b',
        name: 'Operaciones Stars Logistics',
        description: 'Operaciones Stars Logistics',
        created_at: '2025-03-03T17:21:08.410Z',
        updated_at: '2025-07-07T23:15:57.438Z',
      },
      {
        id: 21,
        uuid: 'c9f8e411-137e-4a80-b51f-7558967c8c57',
        name: 'New Role2',
        description: 'This is a test2',
        created_at: '2025-07-07T22:30:19.544Z',
        updated_at: '2025-07-08T00:05:52.780Z',
      },
      {
        id: 18,
        uuid: '368e17d8-52ab-4840-b192-72ef837e6d79',
        name: 'Operaciones AAP',
        description: 'Operaciones Agencia Adunal Pascal',
        created_at: '2025-03-03T17:21:08.410Z',
        updated_at: '2025-07-04T00:24:00.369Z',
      },
    ]);
  }),
  http.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verifySession`, () => {
    return HttpResponse.json({
      name: 'Alice Brown',
      id: 1,
      uuid: 'my-uuid',
      email: 'alice.brown@example.com',
      role: 1,
      casa_user_name: 'ALICECAS',
      iat: 0,
      exp: 0,
    });
  }),
  http.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transbel/upsertPhase`, () => {
    return HttpResponse.json([
      {
        message: 'Datos modificados correctamente',
      },
    ]);
  }),
];
