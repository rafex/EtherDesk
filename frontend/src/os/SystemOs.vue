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
import DesktopShell from '@/shell/DesktopShell.vue';
import type { ServiceAlert } from '@/shared/types';

const BOOT_DELAY_MS = 1800;

const { user, apps, isAuthenticated, login, logout, restoreSession, loadDesktop, submitSatisfaction } = useSystemSession();
const isBooting = ref(false);
const isSubmittingLogin = ref(false);
const isRestoringSession = ref(true);
const loginError = ref('');
const desktopRating = ref(0);
const serviceAlerts = ref<ServiceAlert[]>([]);
const nextServiceAlertId = ref(1);

let bootTimer: number | null = null;

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

async function handleRate(value: number) {
  desktopRating.value = value;

  try {
    await submitSatisfaction(value);
  } catch (error) {
    serviceAlerts.value.push({
      id: nextServiceAlertId.value++,
      service: 'os.feedback',
      title: 'Fallo al registrar satisfaccion',
      message: error instanceof Error ? error.message : 'El servicio devolvio un error inesperado.',
      createdAt: new Date().toISOString(),
    });
  }
}

function handleConsumeServiceAlert(alertId: number) {
  serviceAlerts.value = serviceAlerts.value.filter((alert) => alert.id !== alertId);
}

onBeforeUnmount(() => {
  clearBootTimer();
});

onMounted(async () => {
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
