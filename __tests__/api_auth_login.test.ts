/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/login/route';
import { GPServer } from '@/axios-instance';
import { NextRequest } from 'next/server';

describe('POST /api/auth/login', () => {
  it('returns 200 and logs in succesfully the user', async () => {
    const res = await GPServer.post('/api/auth/login', {
      email: 'alice.brown@example.com',
      password: 'hashed_password_3',
    });

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ name: 'Alice Brown', email: 'alice.brown@example.com' });
  });

  it('returns 400 when email or password is missing', async () => {
    const res = await GPServer.post('/api/auth/login', {
      email: 'alice.brown@example.com',
      password: 'hashed_password_3',
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Email or password missing' });
  });

  it('returns 400 when email is missing', async () => {
    const res = await GPServer.post('/api/auth/login', {
      email: 'alice.brown@example.com',
      password: 'hashed_password_3',
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Email or password missing' });
  });

  it('returns 400 when password is missing', async () => {
    const res = await GPServer.post('/api/auth/login', {
      email: 'alice.brown@example.com',
      password: 'hashed_password_3',
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Email or password missing' });
  });

  it('returns 500 when server is down', async () => {
    const res = await GPServer.post('/api/auth/login', {
      email: 'alice.brown@example.com',
      password: 'hashed_password_3',
    });

    expect(res.status).toBe(500);
    expect(res.data).toEqual({ error: 'Failed to connect to server' });
  });
});
