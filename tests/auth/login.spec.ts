import { test, expect } from '@playwright/test';

const ROUTE = '/api/auth/login';

test(`POST ${ROUTE} returns 200`, async ({ request }) => {
  const response = await request.post(`${ROUTE}`, {
    data: {
      email: process.env.MYGP_TEST_EMAIL,
      password: process.env.MYGP_TEST_PASSWORD,
    },
  });

  expect(response.status()).toBe(200);
});
