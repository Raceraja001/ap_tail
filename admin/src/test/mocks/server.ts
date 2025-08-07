import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { mockApiResponses, mockUser, mockAdminUser } from '../utils';

/**
 * Mock Service Worker Server
 * 
 * Provides API mocking for tests using MSW.
 * Implements Mock Server Pattern for consistent API responses.
 */

const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: mockAdminUser,
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600000,
        },
      });
    }
    
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: mockUser,
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600000,
        },
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      user: {
        id: '3',
        email: body.email,
        name: body.name,
        role: 'user',
        permissions: ['read:users'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      },
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      tokens: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      },
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUser);
  }),

  // Users endpoints
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    
    let users = mockApiResponses.users;
    
    if (search) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = users.slice(start, end);
    
    return HttpResponse.json({
      data: paginatedUsers,
      meta: {
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit),
        hasNext: end < users.length,
        hasPrev: page > 1,
      },
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = mockApiResponses.users.find(u => u.id === params.id);
    
    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(user);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as any;
    
    const newUser = {
      id: String(mockApiResponses.users.length + 1),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockApiResponses.users.push(newUser);
    
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    const userIndex = mockApiResponses.users.findIndex(u => u.id === params.id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    mockApiResponses.users[userIndex] = {
      ...mockApiResponses.users[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(mockApiResponses.users[userIndex]);
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const userIndex = mockApiResponses.users.findIndex(u => u.id === params.id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    mockApiResponses.users.splice(userIndex, 1);
    
    return HttpResponse.json({}, { status: 204 });
  }),

  // Dashboard endpoints
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json(mockApiResponses.dashboardStats);
  }),

  http.get('/api/dashboard/charts/:type', ({ params, request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    
    return HttpResponse.json({
      ...mockApiResponses.chartData,
      type: params.type,
      period,
    });
  }),

  // Settings endpoints
  http.get('/api/settings', () => {
    return HttpResponse.json([
      { id: '1', category: 'general', key: 'site_name', value: 'TailAdmin', type: 'string' },
      { id: '2', category: 'general', key: 'maintenance_mode', value: false, type: 'boolean' },
      { id: '3', category: 'email', key: 'smtp_host', value: 'smtp.example.com', type: 'string' },
    ]);
  }),

  http.put('/api/settings/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Error simulation endpoints
  http.get('/api/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  http.get('/api/error/timeout', () => {
    return new Promise(() => {
      // Never resolve to simulate timeout
    });
  }),

  // Fallback handler
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    );
  }),
];

export const server = setupServer(...handlers);
