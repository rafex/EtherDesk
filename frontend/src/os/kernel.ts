import type { DesktopKernelState, SessionUser } from '@/shared/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

interface KernelAuthResponse {
  token: string;
  user: SessionUser;
}

function createKernelRequest(getToken: () => string | null) {
  return async function kernelRequest<T>(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');

    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    const payload = (await response.json()) as { data?: T; error?: string; message?: string };
    if (!response.ok) {
      throw new Error(payload.message || payload.error || 'Kernel request failed');
    }

    return payload.data as T;
  };
}

export function createEtherDeskKernel(getToken: () => string | null) {
  const request = createKernelRequest(getToken);

  return {
    login(email: string, password: string) {
      return request<KernelAuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    restoreSession() {
      return request<KernelAuthResponse>('/api/auth/session', {
        method: 'GET',
      });
    },
    loadDesktop() {
      return request<DesktopKernelState>('/api/os/desktop', {
        method: 'GET',
      });
    },
    submitSatisfaction(rating: number) {
      return request<{ rating: number }>('/api/os/feedback', {
        method: 'POST',
        body: JSON.stringify({ rating }),
      });
    },
    logout() {
      return request<{ success: boolean }>('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
  };
}
