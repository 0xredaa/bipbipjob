import type {
  Credits,
  Feedback,
  JobOffer,
  JobSector,
  Match,
  Plan,
  User,
} from '@/types';

/**
 * Real API client. Talks to the Express backend (proxied at /api by Vite).
 * Session auth uses an httpOnly cookie, so every call includes credentials.
 */

const BASE = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error || res.statusText, res.status);
  }
  return data as T;
}

export interface AuthPayload {
  user: User;
  credits: Credits;
}

// --- auth --------------------------------------------------------------------

export function register(input: Partial<User> & { email: string; password: string }) {
  return request<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(email: string, password: string) {
  return request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

/** Returns the session user, or null if not authenticated. */
export async function getMe(): Promise<AuthPayload | null> {
  try {
    return await request<AuthPayload>('/auth/me');
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

export function updateProfile(patch: Partial<User>) {
  return request<{ user: User }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

// --- business ----------------------------------------------------------------

export function getCredits(): Promise<Credits> {
  return request<Credits>('/credits');
}

export function getNextOffer(sectors?: JobSector[]): Promise<JobOffer> {
  const q = sectors && sectors.length ? `?sectors=${sectors.join(',')}` : '';
  return request<JobOffer>(`/offers/next${q}`);
}

export function sendMatch(
  offerId: string,
): Promise<{ success: boolean; emailSent: boolean; match?: Match; credits?: Credits }> {
  return request('/match', { method: 'POST', body: JSON.stringify({ offerId }) });
}

export function getMatches(): Promise<Match[]> {
  return request<Match[]>('/matches');
}

export function upgradePlan(plan: Plan): Promise<Credits> {
  return request<Credits>('/plan', { method: 'POST', body: JSON.stringify({ plan }) });
}

export function sendFeedback(feedback: Feedback): Promise<{ success: boolean }> {
  return request('/feedback', { method: 'POST', body: JSON.stringify(feedback) });
}
