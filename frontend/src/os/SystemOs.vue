<template>
  <LoginScreen
    v-if="!isAuthenticated && !isRestoringSession"
    :error-message="loginError"
    :is-submitting="isSubmittingLogin"
    @login="handleLogin"
  />
  <SystemBoot v-else-if="isBooting || isRestoringSession" />
  <DesktopShell
    v-else
    :apps="apps"
    :user-name="user?.name ?? 'ether'"
    :user-email="user?.email ?? 'demo@rafex.dev'"
    :initial-rating="desktopRating"
    :os-version="osVersion"
    :preferences="preferences"
    :monitor-state="monitor"
    :session-expires-at="sessionExpiresAt"
    :service-alerts="serviceAlerts"
    :execute-terminal-command="executeTerminalCommand"
    :update-profile="handleUpdateProfile"
    :create-workspace-file="handleCreateWorkspaceFile"
    :activate-workspace-file="handleActivateWorkspaceFile"
    :duplicate-workspace-file="handleDuplicateWorkspaceFile"
    :rename-workspace-file="handleRenameWorkspaceFile"
    :delete-workspace-file="handleDeleteWorkspaceFile"
    @logout="handleLogout"
    @rate="handleRate"
    @update-preferences="handlePreferencesUpdate"
    @consume-service-alert="handleConsumeServiceAlert"
    @refresh-monitor="handleRefreshMonitor"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SystemBoot from '@/os/SystemBoot.vue';
import LoginScreen from '@/os/LoginScreen.vue';
import { useSystemSession } from '@/os/useSystemSession';
import { addOfflineSyncListener, announceOfflineSyncComplete, flushOfflineQueue, queueOfflineAction } from '@/os/offline';
import DesktopShell from '@/shell/DesktopShell.vue';
import { saveNotesDraft, saveTerminalSnapshot } from '@/os/offline';
import type { DesktopPreferences, FeedbackSubmission, ServiceAlert } from '@/shared/types';

const BOOT_DELAY_MS = 1800;

const { user, apps, preferences, monitor, workspace, sessionExpiresAt, isAuthenticated, login, logout, restoreSession, refreshSession, loadDesktop, submitSatisfaction, syncNotes, syncTerminal, updatePreferences, executeTerminalCommand, renameWorkspaceFile, createWorkspaceFile, activateWorkspaceFile, duplicateWorkspaceFile, deleteWorkspaceFile, updateProfile, loadMonitor } = useSystemSession();
const isBooting = ref(false);
const isSubmittingLogin = ref(false);
const isRestoringSession = ref(true);
const loginError = ref('');
const desktopRating = ref(0);
const osVersion = ref('0.1.0');
const serviceAlerts = ref<ServiceAlert[]>([]);
const nextServiceAlertId = ref(1);

let bootTimer: number | null = null;
let removeSyncListener: (() => void) | null = null;
let sessionRefreshTimer: number | null = null;

function clearSessionRefreshTimer() {
  if (sessionRefreshTimer !== null) {
    window.clearTimeout(sessionRefreshTimer);
    sessionRefreshTimer = null;
  }
}

function scheduleSessionRefresh() {
  clearSessionRefreshTimer();

  if (!sessionExpiresAt.value) {
    return;
  }

  const expiresAt = new Date(sessionExpiresAt.value).getTime();
  const refreshInMs = Math.max(expiresAt - Date.now() - 1000 * 60 * 5, 1000 * 30);
  sessionRefreshTimer = window.setTimeout(async () => {
    try {
      await refreshSession();
      scheduleSessionRefresh();
    } catch {
      await handleLogout();
    }
  }, refreshInMs);
}

function hydrateWorkspaceFromBackend() {
  workspace.value?.notesFiles?.forEach((file) => {
    saveNotesDraft(file.id, file.name, file.content, file.updatedAt, file.updatedAt);
  });

  workspace.value?.terminalFiles?.forEach((file) => {
    saveTerminalSnapshot(
      {
        fileId: file.id,
        name: file.name,
        history: file.history,
        log: file.log,
      },
      file.updatedAt,
      file.updatedAt,
    );
  });
}

async function syncPendingOfflineActions() {
  if (!isAuthenticated.value || !navigator.onLine) {
    return;
  }

  try {
    const result = await flushOfflineQueue({
      syncNotes,
      syncTerminal,
      syncFeedback: submitSatisfaction,
    });

    if (result.processed > 0) {
      announceOfflineSyncComplete();
    }
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.offline-sync',
      title: 'Fallo al sincronizar trabajo offline',
      message: error instanceof Error ? error.message : 'No fue posible enviar los cambios locales al backend.',
      createdAt: new Date().toISOString(),
    });
  }
}

function clearBootTimer() {
  if (bootTimer !== null) {
    window.clearTimeout(bootTimer);
    bootTimer = null;
  }
}

async function bootDesktop() {
  isBooting.value = true;
  clearBootTimer();

  const desktopState = await loadDesktop();
  desktopRating.value = desktopState.preferences.satisfaction;
  osVersion.value = desktopState.kernel.version;
  hydrateWorkspaceFromBackend();
  await loadMonitor();
  scheduleSessionRefresh();
  await syncPendingOfflineActions();

  bootTimer = window.setTimeout(() => {
    isBooting.value = false;
    bootTimer = null;
  }, BOOT_DELAY_MS);
}

async function handleLogin(credentials: { email: string; password: string }) {
  isSubmittingLogin.value = true;
  loginError.value = '';

  try {
    await login(credentials.email, credentials.password);
    await bootDesktop();
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : 'No fue posible iniciar sesion.';
  } finally {
    isSubmittingLogin.value = false;
  }
}

async function handleLogout() {
  clearBootTimer();
  clearSessionRefreshTimer();
  isBooting.value = false;
  loginError.value = '';
  desktopRating.value = 0;
  await logout();
}

async function handleRate(feedback: FeedbackSubmission) {
  desktopRating.value = feedback.rating;

  try {
    if (!navigator.onLine) {
      queueOfflineAction({
        type: 'feedback.sync',
        payload: feedback,
      });
      return;
    }

    await submitSatisfaction(feedback);
  } catch (error) {
    queueOfflineAction({
      type: 'feedback.sync',
      payload: feedback,
    });

    if (navigator.onLine) {
      serviceAlerts.value.push({
        id: nextServiceAlertId.value++,
        service: 'os.feedback',
        title: 'Fallo al registrar satisfaccion',
        message: error instanceof Error ? error.message : 'El servicio devolvio un error inesperado.',
        createdAt: new Date().toISOString(),
      });
    }
  }
}

function handleConsumeServiceAlert(alertId: number) {
  serviceAlerts.value = serviceAlerts.value.filter((alert) => alert.id !== alertId);
}

async function handlePreferencesUpdate(patch: Partial<DesktopPreferences>) {
  try {
    await updatePreferences(patch);
    await loadMonitor();
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.preferences',
      title: 'Fallo al guardar preferencias',
      message: error instanceof Error ? error.message : 'No fue posible guardar las preferencias del desktop.',
      createdAt: new Date().toISOString(),
    });
  }
}

async function handleRefreshMonitor() {
  try {
    await loadMonitor();
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.monitor',
      title: 'Fallo al cargar monitor',
      message: error instanceof Error ? error.message : 'No fue posible cargar el estado del kernel.',
      createdAt: new Date().toISOString(),
    });
  }
}

async function handleRenameWorkspaceFile(fileId: string, name: string) {
  try {
    const result = await renameWorkspaceFile(fileId, name);
    await loadMonitor();
    return result;
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.files.rename',
      title: 'Fallo al renombrar archivo',
      message: error instanceof Error ? error.message : 'No fue posible renombrar el archivo del workspace.',
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}

async function handleCreateWorkspaceFile(type: 'notes' | 'terminal', name: string) {
  try {
    const result = await createWorkspaceFile(type, name);
    await loadMonitor();
    hydrateWorkspaceFromBackend();
    return result;
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.files.create',
      title: 'Fallo al crear archivo',
      message: error instanceof Error ? error.message : 'No fue posible crear el archivo virtual del workspace.',
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}

async function handleActivateWorkspaceFile(fileId: string) {
  try {
    const result = await activateWorkspaceFile(fileId);
    await loadDesktop();
    hydrateWorkspaceFromBackend();
    await loadMonitor();
    return result;
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.files.activate',
      title: 'Fallo al abrir archivo',
      message: error instanceof Error ? error.message : 'No fue posible activar el archivo del workspace.',
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}

async function handleDuplicateWorkspaceFile(fileId: string) {
  try {
    const result = await duplicateWorkspaceFile(fileId);
    await loadMonitor();
    hydrateWorkspaceFromBackend();
    return result;
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.files.duplicate',
      title: 'Fallo al duplicar archivo',
      message: error instanceof Error ? error.message : 'No fue posible duplicar el archivo del workspace.',
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}

async function handleDeleteWorkspaceFile(fileId: string) {
  try {
    const result = await deleteWorkspaceFile(fileId);
    await loadMonitor();
    hydrateWorkspaceFromBackend();
    return result;
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.files.delete',
      title: 'Fallo al eliminar archivo',
      message: error instanceof Error ? error.message : 'No fue posible eliminar el archivo del workspace.',
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}

async function handleUpdateProfile(name: string, email: string) {
  try {
    return await updateProfile(name, email);
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.account.profile',
      title: 'Fallo al actualizar perfil',
      message: error instanceof Error ? error.message : 'No fue posible actualizar el perfil del usuario.',
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}

onBeforeUnmount(() => {
  clearBootTimer();
  clearSessionRefreshTimer();
  removeSyncListener?.();
  window.removeEventListener('online', syncPendingOfflineActions);
});

onMounted(async () => {
  removeSyncListener = addOfflineSyncListener(() => {
    void syncPendingOfflineActions();
  });
  window.addEventListener('online', syncPendingOfflineActions);

  try {
    const restored = await restoreSession();
    if (restored) {
      await bootDesktop();
    }
  } finally {
    isRestoringSession.value = false;
  }
});
</script>
