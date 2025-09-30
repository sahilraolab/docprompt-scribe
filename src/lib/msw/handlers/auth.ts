import { http, HttpResponse } from 'msw';
import { findUserByEmail, findUserById } from '../data/users';

const MOCK_PASSWORD = 'Pass@1234';

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const { email, password } = body;

    const user = findUserByEmail(email);

    if (!user || password !== MOCK_PASSWORD) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Mock token
    const token = btoa(`${user.id}:${Date.now()}`);

    return HttpResponse.json({
      user,
      token,
    });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const [userId] = atob(token).split(':');
      const user = findUserById(userId);

      if (!user) {
        return HttpResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return HttpResponse.json({ user });
    } catch {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),
];
