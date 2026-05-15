
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
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    request<{ userId: string; email: string; roles: string[]; permissions: string[] }>('/auth/me'),
};

// ─── Drops ────────────────────────────────────────────────────────────────────

export const dropsApi = {
  submit: async (formData: FormData) => {
    // Step 1: Create submission with title & description
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File | null;

    const createRes = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, isAnonymous: false }),
    });

    if (!createRes.ok) {
      const err = await createRes
        .json()
        .catch(() => ({ message: 'Submission failed' }));
      throw new Error(err.message);
    }

    const submission = await createRes.json();

    // Step 2: Upload file if provided
    if (file) {
      const fileFormData = new FormData();
      fileFormData.append('file', file);

      const uploadRes = await fetch(`${BASE_URL}/submissions/${submission.id}/attachments`, {
        method: 'POST',
        credentials: 'include',
        body: fileFormData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes
          .json()
          .catch(() => ({ message: 'File upload failed' }));
        throw new Error(err.message);
      }
    }

    return submission;
  },

  listMine: () =>
    request<Drop[]>('/submissions/mine'),

  listAll: () =>
    request<Drop[]>('/submissions'),

  getOne: (id: string) =>
    request<Drop>(`/submissions/${id}`),

  updateStatus: (id: string, status: DropStatus) =>
    // Note: updateStatus endpoint not available in backend
    Promise.reject(new Error('Status update not available')),

  delete: (id: string) =>
    request(`/submissions/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type DropStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role?: string;
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