<template>
  <main
    ref="desktopRef"
    class="desktop-shell"
    :class="{ 'desktop-shell--alt': isAltTheme }"
    @click="closeContextMenu"
    @contextmenu.prevent="openContextMenu"
  >
    <div class="desktop-shell__wallpaper"></div>

    <div class="desktop-topbar">
      <nav class="desktop-topbar__nav" aria-label="Barra superior del sistema">
        <button class="desktop-topbar__item" type="button" @click.stop="openLauncher">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <path d="M9 22V12h6v10"></path>
          </svg>
          <span class="desktop-topbar__tooltip">Home</span>
        </button>

        <button class="desktop-topbar__item" type="button" @click.stop="restoreAllWindows">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 21H4.6c-1.1 0-2-.9-2-2V3"></path>
            <path d="m19 8-7 6-4-4-4 4"></path>
          </svg>
          <span class="desktop-topbar__tooltip">Analytics</span>
        </button>

        <button class="desktop-topbar__item" type="button" @click.stop="notifyNotificationCenter">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="desktop-topbar__tooltip">Notifications</span>
        </button>

        <button class="desktop-topbar__item" type="button" @click.stop="openAppWindow('tars-chat')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            ></path>
          </svg>
          <span class="desktop-topbar__tooltip">Messages</span>
        </button>

        <button class="desktop-topbar__item" type="button" @click.stop="toggleTheme">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
          <span class="desktop-topbar__tooltip">Settings / Color</span>
        </button>

        <label class="desktop-topbar__theme-switch" @click.stop>
          <span>Color</span>
          <input v-model="isAltTheme" type="checkbox" @change="handleThemeToggle" />
          <span class="desktop-topbar__theme-slider"></span>
        </label>
      </nav>
    </div>

    <section
      v-if="isLauncherOpen"
      class="desktop-launcher"
      @click.stop
    >
      <div class="desktop-launcher__grid"></div>
      <div class="desktop-launcher__panel" id="poda">
        <div class="desktop-launcher__glow"></div>
        <div class="desktop-launcher__dark-border"></div>
        <div class="desktop-launcher__dark-border desktop-launcher__dark-border--offset-a"></div>
        <div class="desktop-launcher__dark-border desktop-launcher__dark-border--offset-b"></div>
        <div class="desktop-launcher__white"></div>
        <div class="desktop-launcher__border"></div>

        <div class="desktop-launcher__main">
          <input
            ref="launcherInputRef"
            v-model="launcherQuery"
            class="desktop-launcher__input"
            placeholder="Search..."
            type="text"
            @keydown.esc="closeLauncher"
          />
          <div class="desktop-launcher__input-mask"></div>
          <div class="desktop-launcher__pink-mask"></div>
          <div class="desktop-launcher__filter-border"></div>
          <div class="desktop-launcher__filter-icon" aria-hidden="true">
            <svg
              preserveAspectRatio="none"
              viewBox="4.8 4.56 14.832 15.408"
              fill="none"
            >
              <path
                d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                stroke="#d6d6e6"
                stroke-width="1"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="desktop-launcher__search-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
              fill="none"
            >
              <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
              <line
                stroke="url(#searchl)"
                y2="16.65"
                y1="22"
                x2="16.65"
                x1="22"
              ></line>
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="search">
                  <stop stop-color="#f8e7f8" offset="0%"></stop>
                  <stop stop-color="#b6a9b7" offset="50%"></stop>
                </linearGradient>
                <linearGradient id="searchl">
                  <stop stop-color="#b6a9b7" offset="0%"></stop>
                  <stop stop-color="#837484" offset="50%"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <div class="desktop-launcher__results">
        <button
          v-for="app in filteredApps"
          :key="app.id"
          class="desktop-launcher__result"
          type="button"
          @click="launchFromLauncher(app.id)"
        >
          <span class="desktop-launcher__result-icon">{{ app.icon }}</span>
          <span class="desktop-launcher__result-copy">
            <strong>{{ app.name }}</strong>
            <span>{{ app.description }}</span>
          </span>
        </button>

        <p v-if="filteredApps.length === 0" class="desktop-launcher__empty">
          No hay resultados para "{{ launcherQuery }}".
        </p>
      </div>
    </section>

    <section class="desktop-shell__surface">
      <article
        v-for="windowItem in visibleWindows"
        :key="windowItem.id"
        class="desktop-window"
        :class="{
          'desktop-window--focused': windowItem.id === activeWindowId,
          'desktop-window--maximized': windowItem.isMaximized,
        }"
        :style="windowStyle(windowItem)"
        @mousedown="focusWindow(windowItem.id)"
      >
        <header class="desktop-window__header" @mousedown.stop="startDrag($event, windowItem.id)">
          <div class="desktop-window__traffic-lights">
            <button
              class="desktop-window__traffic-light desktop-window__traffic-light--red"
              type="button"
              aria-label="Minimizar ventana"
              @click.stop="minimizeWindow(windowItem.id)"
            ></button>
            <button
              class="desktop-window__traffic-light desktop-window__traffic-light--yellow"
              type="button"
              aria-label="Maximizar ventana"
              @click.stop="toggleMaximize(windowItem.id)"
            ></button>
            <button
              class="desktop-window__traffic-light desktop-window__traffic-light--green"
              type="button"
              aria-label="Cerrar sesion"
              @click.stop="$emit('logout')"
            ></button>
          </div>

          <div class="desktop-window__title">
            <p class="desktop-window__label">{{ windowItem.label }}</p>
            <span>{{ windowItem.title }}.app</span>
          </div>
        </header>

        <div class="desktop-window__body">
          <div v-if="windowItem.appId === 'tars-chat'" class="desktop-chat">
            <div class="desktop-chat__header">
              <div class="desktop-chat__brand">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                  />
                </svg>
                <div>
                  <strong>TARS Chat</strong>
                  <span>Asistente del sistema</span>
                </div>
              </div>
              <button class="desktop-chat__settings" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                  />
                  <path
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                  />
                </svg>
              </button>
            </div>

            <ul class="desktop-chat__messages">
              <li
                v-for="message in chatMessages"
                :key="message.id"
                class="desktop-chat__message"
                :class="{
                  'desktop-chat__message--user': message.author === 'user',
                  'desktop-chat__message--assistant': message.author === 'assistant',
                }"
              >
                <div class="desktop-chat__time">{{ message.time }}</div>
                <div class="desktop-chat__bubble">{{ message.text }}</div>
              </li>
            </ul>

            <form class="desktop-chat__composer" @submit.prevent="sendChatMessage">
              <input
                v-model="chatDraft"
                type="text"
                placeholder="Reply"
              />
              <button type="submit" aria-label="Enviar mensaje">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                  />
                </svg>
              </button>
            </form>
          </div>

          <div v-else class="desktop-window__editor-card">
            <div class="desktop-window__editor-meta">
              <p class="desktop-window__eyebrow">{{ windowItem.appName }}</p>
              <h2>{{ windowItem.title }}</h2>
              <p>{{ windowItem.description }}</p>
            </div>

            <div class="desktop-window__editor-panel">
              <pre class="desktop-window__editor-content">{{ buildWindowContent(windowItem) }}</pre>
            </div>
          </div>
        </div>
      </article>
    </section>

    <nav class="desktop-dock" aria-label="Aplicaciones">
      <button
        v-for="app in apps"
        :key="app.id"
        class="desktop-dock__item"
        :class="{ 'desktop-dock__item--active': isAppOpen(app.id) }"
        type="button"
        :title="app.description"
        @click.stop="openAppWindow(app.id)"
      >
        <span class="desktop-dock__icon">{{ app.icon }}</span>
        <span class="desktop-dock__name">{{ app.name }}</span>
        <span v-if="isAppOpen(app.id)" class="desktop-dock__indicator"></span>
      </button>
    </nav>

    <section class="desktop-notifications" aria-label="Notificaciones del sistema">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="desktop-notification"
      >
        <div class="desktop-notification__content">
          <div class="desktop-notification__icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m4.5 12.75 6 6 9-13.5"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
              />
            </svg>
          </div>

          <div class="desktop-notification__copy">
            <p>{{ notification.title }}</p>
            <p>{{ notification.description }}</p>
          </div>
        </div>

        <button
          class="desktop-notification__close"
          type="button"
          aria-label="Cerrar notificacion"
          @click="dismissNotification(notification.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 18 18 6M6 6l12 12"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            />
          </svg>
        </button>
      </article>
    </section>

    <div
      v-if="contextMenu.visible"
      class="desktop-context-menu"
      :style="{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }"
      @click.stop
    >
      <button type="button" @click="openLauncher">Abrir launcher</button>
      <button type="button" @click="restoreAllWindows">Mostrar ventanas</button>
      <button type="button" @click="$emit('logout')">Cerrar sesion</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import type { AppShortcut } from '@/shared/types';

interface DesktopWindow {
  id: string;
  appId: string;
  appName: string;
  label: string;
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

interface DesktopNotification {
  id: number;
  title: string;
  description: string;
}

interface ChatMessage {
  id: number;
  author: 'user' | 'assistant';
  text: string;
  time: string;
}

const WINDOW_WIDTH = 440;
const WINDOW_HEIGHT = 320;
const MAXIMIZED_MARGIN = 18;

const props = defineProps<{
  apps: AppShortcut[];
  userName: string;
}>();

defineEmits<{
  logout: [];
}>();

const desktopRef = ref<HTMLElement | null>(null);
const launcherInputRef = ref<HTMLInputElement | null>(null);
const contextMenu = ref<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
});

const activeWindowId = ref('welcome');
const highestZIndex = ref(3);
const nextNotificationId = ref(1);
const notifications = ref<DesktopNotification[]>([]);
const isAltTheme = ref(false);
const isLauncherOpen = ref(false);
const launcherQuery = ref('');
const nextChatMessageId = ref(5);
const chatDraft = ref('');
const chatMessages = ref<ChatMessage[]>([
  {
    id: 1,
    author: 'user',
    text: "Hey TARS, what's your honesty parameter?",
    time: '8:34 AM',
  },
  {
    id: 2,
    author: 'assistant',
    text: '90 percent.',
    time: '8:35 AM',
  },
  {
    id: 3,
    author: 'user',
    text: '90 percent?',
    time: '8:40 AM',
  },
  {
    id: 4,
    author: 'assistant',
    text: 'Absolute honesty is not always the most diplomatic option. Ask me about apps, launcher o ventanas.',
    time: '8:41 AM',
  },
]);
const windows = ref<DesktopWindow[]>([
  {
    id: 'welcome',
    appId: 'system',
    appName: 'EtherDesk',
    label: 'Sesion activa',
    title: `Bienvenido ${props.userName}`,
    description: 'El escritorio esta listo. Puedes abrir apps desde el dock, mover ventanas y usar clic derecho sobre el fondo.',
    x: 64,
    y: 56,
    width: 500,
    height: 320,
    zIndex: 3,
    isMinimized: false,
    isMaximized: false,
  },
]);

const visibleWindows = computed(() => windows.value.filter((windowItem) => !windowItem.isMinimized));
const filteredApps = computed(() => {
  const normalizedQuery = launcherQuery.value.trim().toLowerCase();

  if (!normalizedQuery) {
    return props.apps;
  }

  return props.apps.filter((app) => {
    return `${app.name} ${app.description}`.toLowerCase().includes(normalizedQuery);
  });
});

let dragState:
  | {
      id: string;
      offsetX: number;
      offsetY: number;
    }
  | null = null;

function nextZIndex() {
  highestZIndex.value += 1;
  return highestZIndex.value;
}

function focusWindow(windowId: string) {
  activeWindowId.value = windowId;
  const windowItem = windows.value.find((item) => item.id === windowId);

  if (windowItem) {
    windowItem.zIndex = nextZIndex();
  }
}

function buildWindow(app: AppShortcut): DesktopWindow {
  const offset = windows.value.length * 26;

  return {
    id: `${app.id}-window`,
    appId: app.id,
    appName: app.name,
    label: 'Aplicacion',
    title: app.name,
    description: app.description,
    x: 88 + offset,
    y: 88 + offset,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    zIndex: nextZIndex(),
    isMinimized: false,
    isMaximized: false,
  };
}

function openAppWindow(appId: string) {
  closeContextMenu();
  closeLauncher();

  const existingWindow = windows.value.find((windowItem) => windowItem.appId === appId);
  if (existingWindow) {
    existingWindow.isMinimized = false;
    focusWindow(existingWindow.id);
    notify('App restaurada', `${existingWindow.appName} volvio al escritorio.`);
    return;
  }

  const app = props.apps.find((item) => item.id === appId);
  if (!app) {
    return;
  }

  const windowItem = buildWindow(app);
  windows.value.push(windowItem);
  activeWindowId.value = windowItem.id;
  notify('App abierta', `${app.name} se agrego al escritorio.`);
}

function minimizeWindow(windowId: string) {
  const windowItem = windows.value.find((item) => item.id === windowId);
  if (!windowItem) {
    return;
  }

  windowItem.isMinimized = true;
  notify('Ventana minimizada', `${windowItem.appName} se envio al dock.`);

  const fallbackWindow = visibleWindows.value.find((item) => item.id !== windowId);
  activeWindowId.value = fallbackWindow?.id ?? '';
}

function toggleMaximize(windowId: string) {
  const windowItem = windows.value.find((item) => item.id === windowId);
  if (!windowItem) {
    return;
  }

  windowItem.isMaximized = !windowItem.isMaximized;
  focusWindow(windowId);
  notify(
    windowItem.isMaximized ? 'Ventana maximizada' : 'Ventana restaurada',
    `${windowItem.appName} cambio su tamano de trabajo.`,
  );
}

function restoreAllWindows() {
  windows.value.forEach((windowItem) => {
    windowItem.isMinimized = false;
  });

  if (windows.value[0]) {
    focusWindow(windows.value[0].id);
  }

  closeContextMenu();
  notify('Ventanas restauradas', 'Todas las ventanas visibles volvieron al escritorio.');
}

function isAppOpen(appId: string) {
  return windows.value.some((windowItem) => windowItem.appId === appId && !windowItem.isMinimized);
}

function openContextMenu(event: MouseEvent) {
  const bounds = desktopRef.value?.getBoundingClientRect();
  if (!bounds) {
    return;
  }

  contextMenu.value = {
    visible: true,
    x: Math.min(event.clientX - bounds.left, Math.max(bounds.width - 180, 0)),
    y: Math.min(event.clientY - bounds.top, Math.max(bounds.height - 120, 0)),
  };
}

function closeContextMenu() {
  contextMenu.value.visible = false;
}

function openLauncher() {
  closeContextMenu();
  isLauncherOpen.value = true;
  launcherQuery.value = '';

  nextTick(() => {
    launcherInputRef.value?.focus();
  });
}

function closeLauncher() {
  isLauncherOpen.value = false;
}

function launchFromLauncher(appId: string) {
  openAppWindow(appId);
  notify('Launcher', 'Aplicacion abierta desde el launcher.');
}

function startDrag(event: MouseEvent, windowId: string) {
  const windowItem = windows.value.find((item) => item.id === windowId);
  if (!windowItem || windowItem.isMaximized) {
    return;
  }

  focusWindow(windowId);

  dragState = {
    id: windowId,
    offsetX: event.clientX - windowItem.x,
    offsetY: event.clientY - windowItem.y,
  };
}

function handleMouseMove(event: MouseEvent) {
  if (!dragState || !desktopRef.value) {
    return;
  }

  const bounds = desktopRef.value.getBoundingClientRect();
  const windowItem = windows.value.find((item) => item.id === dragState?.id);

  if (!windowItem || windowItem.isMaximized) {
    return;
  }

  const nextX = event.clientX - bounds.left - dragState.offsetX;
  const nextY = event.clientY - bounds.top - dragState.offsetY;

  windowItem.x = Math.max(12, Math.min(nextX, bounds.width - windowItem.width - 12));
  windowItem.y = Math.max(12, Math.min(nextY, bounds.height - windowItem.height - 96));
}

function stopDrag() {
  dragState = null;
}

function windowStyle(windowItem: DesktopWindow) {
  if (windowItem.isMaximized) {
    return {
      inset: `${MAXIMIZED_MARGIN}px ${MAXIMIZED_MARGIN}px 92px ${MAXIMIZED_MARGIN}px`,
      zIndex: String(windowItem.zIndex),
    };
  }

  return {
    left: `${windowItem.x}px`,
    top: `${windowItem.y}px`,
    width: `${windowItem.width}px`,
    height: `${windowItem.height}px`,
    zIndex: String(windowItem.zIndex),
  };
}

function buildWindowContent(windowItem: DesktopWindow) {
  return [
    `app: ${windowItem.appName}`,
    `title: ${windowItem.title}`,
    '',
    windowItem.description,
    '',
    'status:',
    '- drag enabled',
    '- minimize enabled',
    '- maximize enabled',
    '- context menu enabled',
  ].join('\n');
}

function notify(title: string, description: string) {
  const id = nextNotificationId.value;
  nextNotificationId.value += 1;

  notifications.value.unshift({
    id,
    title,
    description,
  });

  window.setTimeout(() => {
    dismissNotification(id);
  }, 3200);
}

function dismissNotification(notificationId: number) {
  notifications.value = notifications.value.filter((item) => item.id !== notificationId);
}

function handleThemeToggle() {
  notify(
    'Tema actualizado',
    isAltTheme.value ? 'El sistema cambio a la paleta nocturna.' : 'El sistema volvio a la paleta oceano.',
  );
}

function toggleTheme() {
  isAltTheme.value = !isAltTheme.value;
  handleThemeToggle();
}

function notifyNotificationCenter() {
  notify('Notifications', 'El centro de notificaciones estara disponible en una siguiente iteracion.');
}

function sendChatMessage() {
  const message = chatDraft.value.trim();
  if (!message) {
    return;
  }

  const userMessageId = nextChatMessageId.value++;
  const assistantMessageId = nextChatMessageId.value++;

  chatMessages.value.push({
    id: userMessageId,
    author: 'user',
    text: message,
    time: currentChatTime(),
  });

  chatDraft.value = '';

  window.setTimeout(() => {
    chatMessages.value.push({
      id: assistantMessageId,
      author: 'assistant',
      text: buildAssistantReply(message),
      time: currentChatTime(),
    });
  }, 420);
}

function buildAssistantReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('launcher')) {
    return 'Puedes abrir el launcher con clic derecho en el escritorio o con Cmd/Ctrl + K.';
  }

  if (normalized.includes('tema') || normalized.includes('color')) {
    return 'El interruptor de la esquina superior derecha cambia la paleta visual completa del sistema.';
  }

  if (normalized.includes('ventana') || normalized.includes('window')) {
    return 'Las ventanas se pueden mover, minimizar y maximizar desde su barra superior.';
  }

  return 'Puedo ayudarte con el launcher, las ventanas, el tema visual y las apps disponibles en EtherDesk.';
}

function currentChatTime() {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
}

function handleKeydown(event: KeyboardEvent) {
  const isLauncherHotkey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

  if (isLauncherHotkey) {
    event.preventDefault();

    if (isLauncherOpen.value) {
      closeLauncher();
    } else {
      openLauncher();
      notify('Launcher', 'Launcher abierto con atajo de teclado.');
    }
  }

  if (event.key === 'Escape' && isLauncherOpen.value) {
    closeLauncher();
  }
}

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', stopDrag);
window.addEventListener('keydown', handleKeydown);

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('keydown', handleKeydown);
});
</script>
