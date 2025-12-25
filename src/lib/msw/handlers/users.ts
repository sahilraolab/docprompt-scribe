import { http, HttpResponse } from 'msw';
import { users, findUserById } from '../data/users';
import { MockUser } from '@/types';

let mockUsers = [...users];

export const userHandlers = [
  // Get all users
  http.get('/api/users', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: mockUsers,
    });
  }),

  // Get user by ID
  http.get('/api/users/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = mockUsers.find((u) => u.id === params.id);
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
  }),

  // Create user
  http.post('/api/users', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as Partial<MockUser> & { password: string };
    
    if (!body.name || !body.email || !body.password || !body.role) {
      return HttpResponse.json(
        { success: false, message: 'Name, email, password, and role are required.' },
        { status: 400 }
      );
    }

    const existing = mockUsers.find((u) => u.email === body.email);
    if (existing) {
      return HttpResponse.json(
        { success: false, message: 'Email already exists.' },
        { status: 400 }
      );
    }

    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      department: body.department,
      avatarUrl: body.avatarUrl,
      active: body.active ?? true,
      preferences: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        numberFormat: 'short',
      },
    };

    mockUsers.push(newUser);

    return HttpResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  }),

  // Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userIndex = mockUsers.findIndex((u) => u.id === params.id);
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as Partial<MockUser>;
    const updatedUser: MockUser = {
      ...mockUsers[userIndex],
      ...body,
    };

    mockUsers[userIndex] = updatedUser;

    return HttpResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  }),

  // Delete user
  http.delete('/api/users/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userIndex = mockUsers.findIndex((u) => u.id === params.id);
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    mockUsers.splice(userIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  }),
];
