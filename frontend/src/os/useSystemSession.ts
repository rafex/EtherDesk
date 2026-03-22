import { computed, ref } from 'vue';
import type { SessionUser } from '@/shared/types';

const DEFAULT_USER = 'ether';

const activeUser = ref<SessionUser | null>(null);

function createSessionUser(name: string): SessionUser {
  return {
    id: 'local-user',
    name,
    role: 'owner',
  };
}

export function useSystemSession() {
  const isAuthenticated = computed(() => activeUser.value !== null);

  function login(name: string) {
    const normalizedName = name.trim() || DEFAULT_USER;
    activeUser.value = createSessionUser(normalizedName);
  }

  function logout() {
    activeUser.value = null;
  }

  return {
    user: activeUser,
    isAuthenticated,
    login,
    logout,
  };
}
