<template>
  <section class="login-screen" @click="showForm = true">
    <div class="login-screen__backdrop"></div>

    <div class="login-screen__lock" :class="{ 'login-screen__lock--hidden': showForm }">
      <p class="login-screen__time">{{ lockTime }}</p>
      <p class="login-screen__date">{{ lockDate }}</p>
      <button class="login-screen__enter" type="button" @click.stop="showForm = true">
        Entrar
      </button>
    </div>

    <div
      class="login-screen__auth"
      :class="{ 'login-screen__auth--visible': showForm }"
      @click.stop
    >
      <button class="login-screen__back" type="button" @click="showForm = false">
        ⟵ Volver
      </button>

      <div class="login-screen__identity">
        <img class="login-screen__avatar" :src="avatarUrl" alt="Usuario demo" />
        <strong>Demo User</strong>
        <span>demo@rafex.dev</span>
      </div>

      <div class="login-card">
        <div class="login-card__heading">EtherDesk</div>

        <form class="login-card__form" @submit.prevent="submitLogin">
          <input
            v-model="username"
            required
            class="login-card__input"
            type="email"
            name="email"
            placeholder="E-mail"
            autocomplete="username"
          />

          <input
            v-model="password"
            required
            class="login-card__input"
            type="password"
            name="password"
            placeholder="Password"
            autocomplete="current-password"
          />

          <p v-if="errorMessage" class="login-card__error">{{ errorMessage }}</p>

          <span class="login-card__forgot">
            <a href="#" @click.prevent>Autenticacion delegada al kernel del backend</a>
          </span>

          <button class="login-card__submit" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{
  errorMessage?: string;
  isSubmitting?: boolean;
}>();
const emit = defineEmits<{
  login: [credentials: { email: string; password: string }];
}>();

const username = ref('demo@rafex.dev');
const password = ref('demo');
const showForm = ref(false);
const lockTime = ref('');
const lockDate = ref('');
let clockTimer: number | null = null;

const avatarUrl = computed(() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Demo User">
      <defs>
        <linearGradient id="login-avatar" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#8fb8ff" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="24" fill="url(#login-avatar)" />
      <circle cx="48" cy="34" r="13" fill="rgba(255,255,255,0.24)" />
      <path d="M22 77c4-13 15-21 26-21s22 8 26 21" fill="rgba(255,255,255,0.2)" />
      <text x="48" y="55" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="white">DR</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

function syncClock() {
  const now = new Date();
  lockTime.value = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
  lockDate.value = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
}

function submitLogin() {
  emit('login', {
    email: username.value.trim(),
    password: password.value,
  });
}

onMounted(() => {
  syncClock();
  clockTimer = window.setInterval(syncClock, 30000);
});

onBeforeUnmount(() => {
  if (clockTimer !== null) {
    window.clearInterval(clockTimer);
  }
});
</script>
