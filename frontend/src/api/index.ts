const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(
    `${BASE_URL}${path}`,
    {
      credentials: 'include',

      headers: {
        'Content-Type':
          'application/json',
        ...options.headers,
      },

      ...options,
    },
  );

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({
        message:
          'Request failed',
      }));

    throw new Error(
      err.message ||
        `HTTP ${res.status}`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    email: string;
    password: string;
  }) =>
    request<User>(
      '/auth/register',
      {
        method: 'POST',

        body: JSON.stringify(
          data,
        ),
      },
    ),

  login: (data: {
    email: string;
    password: string;
  }) =>
    request<{
      access_token: string;
    }>('/auth/login', {
      method: 'POST',

      body: JSON.stringify(
        data,
      ),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    request<{
      userId: string;
      email: string;
      roles: string[];
      permissions: string[];
    }>('/auth/me'),
};

// ─── Submissions ──────────────────────────────────────────────────────────────

export const dropsApi = {
  submit: async (
    formData: FormData,
  ) => {
    const title =
      formData.get(
        'title',
      ) as string;

    const description =
      formData.get(
        'description',
      ) as string;

    const file =
      formData.get(
        'file',
      ) as File | null;

    // Step 1 — create submission

    const submission =
      await request<Drop>(
        '/submissions',
        {
          method: 'POST',

          body: JSON.stringify(
            {
              title,
              description,
              isAnonymous: false,
            },
          ),
        },
      );

    // Step 2 — upload attachment

    if (file) {
      const uploadData =
        new FormData();

      uploadData.append(
        'file',
        file,
      );

      const uploadRes =
        await fetch(
          `${BASE_URL}/submissions/${submission.id}/attachments`,
          {
            method: 'POST',

            credentials:
              'include',

            body: uploadData,
          },
        );

      if (!uploadRes.ok) {
        const err =
          await uploadRes
            .json()
            .catch(() => ({
              message:
                'Attachment upload failed',
            }));

        throw new Error(
          err.message,
        );
      }
    }

    // reload updated submission with attachments

    return request<Drop>(
      `/submissions/${submission.id}`,
    );
  },

  listMine: () =>
    request<Drop[]>(
      '/submissions/mine',
    ),

  listAll: () =>
    request<Drop[]>(
      '/submissions',
    ),

  getOne: (id: string) =>
    request<Drop>(
      `/submissions/${id}`,
    ),

  updateStatus: (
    id: string,
    status: DropStatus,
  ) =>
    request<Drop>(
      `/submissions/${id}/status`,
      {
        method: 'PATCH',

        body: JSON.stringify({
          status,
        }),
      },
    ),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'USER'
  | 'MODERATOR'
  | 'ADMIN';

export type DropStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'REJECTED';

export interface User {
  id: string;

  email: string;

  role?: UserRole;

  roles?: string[];

  permissions?: string[];

  createdAt: string;
}

export interface Attachment {
  id: string;

  originalName: string;

  mimeType: string;

  fileSize: number;

  createdAt: string;
}

export interface Drop {
  id: string;

  title?: string;

  description: string;

  isAnonymous: boolean;

  status: DropStatus;

  createdAt: string;

  updatedAt: string;

  author?: {
    id: string;
    email: string;
  } | null;

  attachments: Attachment[];
}