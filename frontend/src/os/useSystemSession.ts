import { computed, ref } from 'vue';
import type { AppShortcut, DesktopKernelState, FeedbackSubmission, SessionUser } from '@/shared/types';
import { createEtherDeskKernel } from '@/os/kernel';

const SESSION_TOKEN_KEY = 'etherdesk.session.token';

const activeUser = ref<SessionUser | null>(null);
const desktopApps = ref<AppShortcut[]>([]);
const sessionToken = ref<string | null>(readStoredToken());
const kernel = createEtherDeskKernel(() => sessionToken.value);

function readStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(SESSION_TOKEN_KEY);
}

function storeToken(token: string | null) {
  sessionToken.value = token;

  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

function applyDesktopState(state: DesktopKernelState) {
  activeUser.value = state.user;
  desktopApps.value = state.apps;
}

export function useSystemSession() {
  const isAuthenticated = computed(() => activeUser.value !== null && Boolean(sessionToken.value));

  async function login(email: string, password: string) {
    const data = await kernel.login(email, password);

    storeToken(data.token);
    activeUser.value = data.user;

    return data.user;
  }

  async function restoreSession() {
    if (!sessionToken.value) {
      return false;
    }

    try {
      const data = await kernel.restoreSession();

      storeToken(data.token);
      activeUser.value = data.user;
      return true;
    } catch {
      storeToken(null);
      activeUser.value = null;
      desktopApps.value = [];
      return false;
    }
  }

  async function loadDesktop() {
    const data = await kernel.loadDesktop();

    applyDesktopState(data);
    return data;
  }

  async function submitSatisfaction(feedback: FeedbackSubmission) {
    await kernel.submitSatisfaction(feedback);
  }

  async function syncNotes(content: { content: string; updatedAt: string; syncedAt?: string | null }) {
    await kernel.syncNotes(content);
  }

  async function syncTerminal(snapshot: { history: string[]; log: string[]; updatedAt: string; syncedAt?: string | null }) {
    await kernel.syncTerminal(snapshot);
  }

  async function logout() {
    try {
      if (sessionToken.value) {
        await kernel.logout();
      }
    } finally {
      storeToken(null);
      activeUser.value = null;
      desktopApps.value = [];
    }
  }

  return {
    user: activeUser,
    apps: desktopApps,
    isAuthenticated,
    login,
    restoreSession,
    loadDesktop,
    submitSatisfaction,
    syncNotes,
    syncTerminal,
    logout,
  };
}
