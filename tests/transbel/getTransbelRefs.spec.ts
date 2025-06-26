import { test, expect } from '@playwright/test';

const ROUTE = '/api/transbel/getTransbelRefs';

test(`POST ${ROUTE} returns 200`, async ({ request }) => {
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: process.env.MYGP_TEST_EMAIL,
      password: process.env.MYGP_TEST_PASSWORD,
    },
  });

  const session_token = loginResponse.headers()['set-cookie'];

  expect(loginResponse.status()).toBe(200);

  const response = await request.get(`${ROUTE}`, {
    headers: {
      'Set-Cookie': session_token,
    },
  });

  expect(response.status()).toBe(200);
});
