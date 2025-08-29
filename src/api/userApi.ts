import type { User } from '../types';

export interface ApiResponse {
  data: User[];
  meta: {
    totalRowCount: number;
  };
}

// CORRECTED: This function now accepts a 'query' string
export const fetchUsers = async (query: string): Promise<ApiResponse> => {
  // It uses the query to build the correct API endpoint URL
  const response = await fetch(`/api/users?query=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

// This function was already correct, no changes needed
export const updateUserStatus = async (userToUpdate: {
  id: string;
  status: 'active' | 'inactive';
}): Promise<User> => {
  const response = await fetch(`/api/users/${userToUpdate.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: userToUpdate.status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
};

