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
    :service-alerts="serviceAlerts"
    @logout="handleLogout"
    @rate="handleRate"
    @consume-service-alert="handleConsumeServiceAlert"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SystemBoot from '@/os/SystemBoot.vue';
import LoginScreen from '@/os/LoginScreen.vue';
import { useSystemSession } from '@/os/useSystemSession';
import { addOfflineSyncListener, announceOfflineSyncComplete, flushOfflineQueue, queueOfflineAction } from '@/os/offline';
import DesktopShell from '@/shell/DesktopShell.vue';
import type { FeedbackSubmission, ServiceAlert } from '@/shared/types';

const BOOT_DELAY_MS = 1800;

const { user, apps, isAuthenticated, login, logout, restoreSession, loadDesktop, submitSatisfaction, syncNotes, syncTerminal } = useSystemSession();
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

onBeforeUnmount(() => {
  clearBootTimer();
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
