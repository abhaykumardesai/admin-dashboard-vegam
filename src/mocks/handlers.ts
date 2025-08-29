// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { db } from './data';
import type { User } from '../types';

const users: User[] = [...db];

export const handlers = [
  // Handles GET /api/users
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase() || '';
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '0');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    let filteredUsers = users;

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (query) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    const totalCount = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

    return HttpResponse.json({
      data: paginatedUsers,
      meta: { totalRowCount: totalCount },
    });
  }),

http.patch('/api/users/:userId', async ({ params, request }) => {
    const { userId } = params;
    const { status } = await request.json() as { status: 'active' | 'inactive' };

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return new HttpResponse(null, { status: 404 });
    }

    users[userIndex] = { ...users[userIndex], status };

    return HttpResponse.json(users[userIndex]);
  }),
];