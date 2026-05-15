
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: 'Request failed' }));

    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string }) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    request<User>('/auth/me'),
};

// ─── Drops ────────────────────────────────────────────────────────────────────

export const dropsApi = {
  submit: (formData: FormData) =>
    fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: 'Upload failed' }));

        throw new Error(err.message);
      }

      return res.json();
    }),

  listMine: () =>
    request<Drop[]>('/submissions/mine'),

  listAll: () =>
    request<Drop[]>('/submissions'),

  getOne: (id: string) =>
    request<Drop>(`/submissions/${id}`),

  updateStatus: (id: string, status: DropStatus) =>
    request<Drop>(`/submissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request(`/submissions/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  listUsers: () =>
    request<User[]>('/admin/users'),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type DropStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'DISMISSED';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Drop {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: DropStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}