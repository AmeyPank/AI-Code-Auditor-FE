import type { CreateReviewInput, CurrentAccess, HealthStatus, Review, ReviewListItem } from '../../../types/review';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const GUEST_ID_STORAGE_KEY = 'ai-code-auditor.guest-id';

/** Keeps a stable anonymous identity in this browser until the user signs in. */
export function getGuestId(): string {
  let guestId = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (!guestId) {
    guestId = window.crypto.randomUUID();
    window.localStorage.setItem(GUEST_ID_STORAGE_KEY, guestId);
  }
  return guestId;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

/** Reads Nest's standard error payload and returns a useful message for the UI. */
async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] | { message?: string; code?: string } };
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (typeof body.message === 'string') return body.message;
    if (body.message?.message) return body.message.message;
  } catch {
    // Fall back to the HTTP status when the server didn't return JSON.
  }
  return `Request failed (${response.status} ${response.statusText})`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'x-guest-id': getGuestId(), ...init?.headers },
  });
  if (!response.ok) {
    let code: string | undefined;
    try {
      const payload = await response.clone().json() as { message?: { code?: string } };
      code = payload.message && typeof payload.message === 'object' ? payload.message.code : undefined;
    } catch { /* The message reader below handles non-JSON error bodies. */ }
    throw new ApiError(await readApiError(response), response.status, code);
  }
  return (await response.json()) as T;
}

export const reviewsApi = {
  checkHealth: () => request<HealthStatus>('/health'),

  access: () => request<CurrentAccess>('/auth/me'),

  register: (input: { displayName: string; email: string; password: string }) =>
    request<CurrentAccess>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),

  login: (input: { email: string; password: string }) =>
    request<CurrentAccess>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),

  googleLogin: (credential: string) =>
    request<CurrentAccess>('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  list: (limit = 20) =>
    request<ReviewListItem[]>(`/reviews?limit=${encodeURIComponent(limit)}`),

  get: (id: string) => request<Review>(`/reviews/${encodeURIComponent(id)}`),

  create: (input: CreateReviewInput) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(input) }),
};
