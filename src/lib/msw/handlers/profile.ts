import { http, HttpResponse } from 'msw';
import { users } from '../data/users';

export const profileHandlers = [
  http.get('/api/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const [userId] = atob(token).split(':');
      const user = users.find((u) => u.id === userId);

      if (!user) {
        return HttpResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: user,
      });
    } catch {
      return HttpResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  }),

  http.put('/api/profile', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await request.json() as any;

    try {
      const [userId] = atob(token).split(':');
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        return HttpResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      users[userIndex] = {
        ...users[userIndex],
        ...body,
        id: userId,
      };

      return HttpResponse.json({
        success: true,
        data: users[userIndex],
        message: 'Profile updated successfully',
      });
    } catch {
      return HttpResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  }),

  http.put('/api/profile/password', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as { currentPassword: string; newPassword: string };

    // Mock password validation (in real app, check against stored hash)
    if (body.currentPassword !== 'Pass@1234') {
      return HttpResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 6) {
      return HttpResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  }),
];
