/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/login/route';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockedCookies = cookies as jest.Mock;

function mockPostRequest(body: object, cookie?: string) {
  return new NextRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe(`POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, () => {
  it('returns 200 and logs in succesfully the user', async () => {
    const req = mockPostRequest({
      email: process.env.MYGP_TEST_EMAIL,
      password: process.env.MYGP_TEST_PASSWORD,
    });

    const mockSet = jest.fn();

    mockedCookies.mockReturnValue({
      set: mockSet,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockSet).toHaveBeenCalledWith('session_token', expect.any(String));
  });

  it('returns 400 when email or password is missing', async () => {
    const req = mockPostRequest({});

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
