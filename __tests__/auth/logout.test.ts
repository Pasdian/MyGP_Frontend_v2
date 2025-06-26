/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/logout/route';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockedCookies = cookies as jest.Mock;

function mockPostRequest(body: object) {
  return new NextRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'mock_cookie',
    },
  });
}

describe(`POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, () => {
  it('returns 200 and logs out succesfully the user', async () => {
    const mockDeleteCookie = jest.fn();

    mockedCookies.mockReturnValue({
      delete: mockDeleteCookie,
    });

    const res = await POST(mockPostRequest({}));

    expect(res.status).toBe(200);
    expect(mockDeleteCookie).toHaveBeenCalledWith('session_token');
  });
});
