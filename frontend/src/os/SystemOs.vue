<template>
  <LoginScreen v-if="!isAuthenticated" @login="handleLogin" />
  <SystemBoot v-else-if="isBooting" />
  <DesktopShell
    v-else
    :apps="desktopApps"
    :user-name="user?.name ?? 'ether'"
    @logout="handleLogout"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { desktopApps } from '@/apps/apps';
import SystemBoot from '@/os/SystemBoot.vue';
import LoginScreen from '@/os/LoginScreen.vue';
import { useSystemSession } from '@/os/useSystemSession';
import DesktopShell from '@/shell/DesktopShell.vue';

const BOOT_DELAY_MS = 1800;

const { user, isAuthenticated, login, logout } = useSystemSession();
const isBooting = ref(false);

let bootTimer: number | null = null;

function clearBootTimer() {
  if (bootTimer !== null) {
    window.clearTimeout(bootTimer);
    bootTimer = null;
  }
}

function handleLogin(username: string) {
  login(username);
  isBooting.value = true;
  clearBootTimer();

  bootTimer = window.setTimeout(() => {
    isBooting.value = false;
    bootTimer = null;
  }, BOOT_DELAY_MS);
}

function handleLogout() {
  clearBootTimer();
  isBooting.value = false;
  logout();
}

onBeforeUnmount(() => {
  clearBootTimer();
});
</script>
