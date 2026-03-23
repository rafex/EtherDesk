import { computed, ref } from 'vue';
import type { AppShortcut, DesktopKernelState, DesktopPreferences, FeedbackSubmission, KernelMonitorState, NotesDraftSnapshot, SessionUser, TerminalSessionSnapshot } from '@/shared/types';
import { createEtherDeskKernel } from '@/os/kernel';

const SESSION_TOKEN_KEY = 'etherdesk.session.token';

const activeUser = ref<SessionUser | null>(null);
const desktopApps = ref<AppShortcut[]>([]);
const desktopPreferences = ref<DesktopPreferences | null>(null);
const desktopWorkspace = ref<DesktopKernelState['workspace'] | null>(null);
const kernelMonitor = ref<KernelMonitorState | null>(null);
const sessionToken = ref<string | null>(readStoredToken());
const sessionExpiresAt = ref<string | null>(null);
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
  desktopPreferences.value = state.preferences;
  desktopWorkspace.value = state.workspace ?? null;
}

export function useSystemSession() {
  const isAuthenticated = computed(() => activeUser.value !== null && Boolean(sessionToken.value));

  async function login(email: string, password: string) {
    const data = await kernel.login(email, password);

    storeToken(data.token);
    activeUser.value = data.user;
    sessionExpiresAt.value = data.expiresAt;

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
      sessionExpiresAt.value = data.expiresAt;
      return true;
    } catch {
      storeToken(null);
      activeUser.value = null;
      desktopApps.value = [];
      sessionExpiresAt.value = null;
      return false;
    }
  }

  async function loadDesktop() {
    const data = await kernel.loadDesktop();

    applyDesktopState(data);
    return data;
  }

  async function refreshSession() {
    const data = await kernel.refreshSession();
    storeToken(data.token);
    activeUser.value = data.user;
    sessionExpiresAt.value = data.expiresAt;
    return data;
  }

  async function submitSatisfaction(feedback: FeedbackSubmission) {
    await kernel.submitSatisfaction(feedback);
  }

  async function syncNotes(content: NotesDraftSnapshot) {
    await kernel.syncNotes(content);
  }

  async function syncTerminal(snapshot: TerminalSessionSnapshot) {
    await kernel.syncTerminal(snapshot);
  }

  async function updatePreferences(preferences: Partial<DesktopPreferences>) {
    const data = await kernel.updatePreferences(preferences);
    desktopPreferences.value = data;
    return data;
  }

  async function executeTerminalCommand(command: string) {
    return kernel.executeTerminalCommand(command);
  }

  async function renameWorkspaceFile(fileId: string, name: string) {
    const data = await kernel.renameWorkspaceFile(fileId, name);
    if (desktopWorkspace.value?.files) {
      desktopWorkspace.value.files = desktopWorkspace.value.files.map((file) =>
        file.id === fileId ? { ...file, name: data.name, updatedAt: data.updatedAt } : file,
      );
    }
    return data;
  }

  async function createWorkspaceFile(type: 'notes' | 'terminal', name: string) {
    const data = await kernel.createWorkspaceFile(type, name);
    if (!data) {
      return data;
    }

    if (!desktopWorkspace.value) {
      desktopWorkspace.value = { notes: null, terminal: null, files: [] };
    }

    const remainingFiles = (desktopWorkspace.value.files ?? []).filter((file) => file.id !== data.id);
    desktopWorkspace.value.files = [...remainingFiles, data];
    return data;
  }

  async function activateWorkspaceFile(fileId: string) {
    return kernel.activateWorkspaceFile(fileId);
  }

  async function duplicateWorkspaceFile(fileId: string) {
    const data = await kernel.duplicateWorkspaceFile(fileId);
    if (!desktopWorkspace.value) {
      desktopWorkspace.value = { notes: null, terminal: null, files: [] };
    }

    const remainingFiles = (desktopWorkspace.value.files ?? []).filter((file) => file.id !== data.id);
    desktopWorkspace.value.files = [...remainingFiles, data];
    return data;
  }

  async function deleteWorkspaceFile(fileId: string) {
    const data = await kernel.deleteWorkspaceFile(fileId);
    if (data.success && desktopWorkspace.value) {
      desktopWorkspace.value.files = (desktopWorkspace.value.files ?? []).filter((file) => file.id !== fileId);
      if (fileId === 'notes-file') {
        desktopWorkspace.value.notes = null;
      }
      if (fileId === 'terminal-file') {
        desktopWorkspace.value.terminal = null;
      }
    }
    return data;
  }

  async function updateProfile(name: string, email: string) {
    const user = await kernel.updateProfile(name, email);
    activeUser.value = user;
    return user;
  }

  async function loadMonitor() {
    const data = await kernel.loadMonitor();
    kernelMonitor.value = data;
    return data;
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
      desktopPreferences.value = null;
      desktopWorkspace.value = null;
      kernelMonitor.value = null;
      sessionExpiresAt.value = null;
    }
  }

  return {
    user: activeUser,
    apps: desktopApps,
    preferences: desktopPreferences,
    workspace: desktopWorkspace,
    monitor: kernelMonitor,
    sessionExpiresAt,
    isAuthenticated,
    login,
    restoreSession,
    refreshSession,
    loadDesktop,
    submitSatisfaction,
    syncNotes,
    syncTerminal,
    updatePreferences,
    executeTerminalCommand,
    renameWorkspaceFile,
    createWorkspaceFile,
    activateWorkspaceFile,
    duplicateWorkspaceFile,
    deleteWorkspaceFile,
    updateProfile,
    loadMonitor,
    logout,
  };
}
