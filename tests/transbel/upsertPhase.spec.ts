import { test, expect } from '@playwright/test';

const ROUTE = '/api/transbel/upsertPhase';

test(`POST ${ROUTE} returns 200`, async ({ request }) => {
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: process.env.MYGP_TEST_EMAIL,
      password: process.env.MYGP_TEST_PASSWORD,
    },
  });

  const session_token = loginResponse.headers()['set-cookie'];

  expect(loginResponse.status()).toBe(200);

  const res = await request.post(`${ROUTE}`, {
    data: {
      ref: 'TESTPHASE',
      phase: '140',
      exceptionCode: 'PW_AP',
      date: '2025-06-01 00:00',
      user: 'MYGP',
    },
    headers: {
      'Set-Cookie': session_token,
    },
  });

  expect(res.status()).toBe(200);
});
