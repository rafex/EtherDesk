import type { DesktopKernelState, DesktopPreferences, FeedbackSubmission, KernelMonitorState, NotesDraftSnapshot, SessionEnvelope, TerminalSessionSnapshot } from '@/shared/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

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
      return request<SessionEnvelope>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    restoreSession() {
      return request<SessionEnvelope>('/api/auth/session', {
        method: 'GET',
      });
    },
    refreshSession() {
      return request<SessionEnvelope>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    loadDesktop() {
      return request<DesktopKernelState>('/api/os/desktop', {
        method: 'GET',
      });
    },
    submitSatisfaction(feedback: FeedbackSubmission) {
      return request<{ rating: number }>('/api/os/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback),
      });
    },
    syncNotes(snapshot: NotesDraftSnapshot) {
      return request<{ updatedAt: string }>('/api/os/notes/sync', {
        method: 'POST',
        body: JSON.stringify(snapshot),
      });
    },
    syncTerminal(snapshot: TerminalSessionSnapshot) {
      return request<{ updatedAt: string }>('/api/os/terminal/sync', {
        method: 'POST',
        body: JSON.stringify(snapshot),
      });
    },
    updatePreferences(preferences: Partial<DesktopPreferences>) {
      return request<DesktopPreferences>('/api/os/preferences', {
        method: 'POST',
        body: JSON.stringify(preferences),
      });
    },
    executeTerminalCommand(command: string) {
      return request<{ ok: boolean; output: string[] }>('/api/os/terminal/execute', {
        method: 'POST',
        body: JSON.stringify({ command }),
      });
    },
    renameWorkspaceFile(fileId: string, name: string) {
      return request<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string }>('/api/os/files/rename', {
        method: 'POST',
        body: JSON.stringify({ fileId, name }),
      });
    },
    createWorkspaceFile(type: 'notes' | 'terminal', name: string) {
      return request<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string } | null>('/api/os/files/create', {
        method: 'POST',
        body: JSON.stringify({ type, name }),
      });
    },
    activateWorkspaceFile(fileId: string) {
      return request<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string }>('/api/os/files/activate', {
        method: 'POST',
        body: JSON.stringify({ fileId }),
      });
    },
    duplicateWorkspaceFile(fileId: string) {
      return request<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string }>('/api/os/files/duplicate', {
        method: 'POST',
        body: JSON.stringify({ fileId }),
      });
    },
    deleteWorkspaceFile(fileId: string) {
      return request<{ success: boolean }>('/api/os/files/delete', {
        method: 'POST',
        body: JSON.stringify({ fileId }),
      });
    },
    updateProfile(name: string, email: string) {
      return request<{ id: string; name: string; email: string; role: string }>('/api/os/account/profile', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
      });
    },
    loadMonitor() {
      return request<KernelMonitorState>('/api/os/monitor', {
        method: 'GET',
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
