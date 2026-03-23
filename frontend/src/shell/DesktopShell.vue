<template>
  <main
    ref="desktopRef"
    class="desktop-shell"
    :class="[
      { 'desktop-shell--alt': isAltTheme },
      `desktop-shell--wallpaper-${wallpaperVariant}`,
    ]"
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

        <button class="desktop-topbar__item" type="button" @click.stop="openNotificationCenter">
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

        <button class="desktop-topbar__item" type="button" @click.stop="openAppWindow('settings')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
          <span class="desktop-topbar__tooltip">Settings</span>
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
        <div class="desktop-launcher__summary">
          <div>
            <strong>{{ launcherTime }}</strong>
            <span>{{ launcherDate }}</span>
          </div>
          <button class="desktop-launcher__logout" type="button" @click="$emit('logout')">
            Cerrar sesion
          </button>
        </div>

        <div class="desktop-launcher__profile">
          <img class="desktop-launcher__avatar" :src="userAvatarUrl" :alt="profileDraft.name" />
          <div class="desktop-launcher__profile-copy">
            <strong>{{ profileDraft.name }}</strong>
            <span>{{ profileDraft.email }}</span>
          </div>
        </div>

        <div v-for="group in launcherGroups" :key="group.id" class="desktop-launcher__group">
          <div class="desktop-launcher__group-head">
            <strong>{{ group.label }}</strong>
            <span>{{ group.entries.length }}</span>
          </div>

          <div class="desktop-launcher__apps">
            <button
              v-for="entry in group.entries"
              :key="entry.id"
              class="desktop-launcher__result"
              :class="{ 'desktop-launcher__result--web': entry.group === 'web' }"
              type="button"
              @click="launchLauncherEntry(entry)"
            >
              <span class="desktop-launcher__result-icon">
                <img v-if="entry.iconUrl" :src="entry.iconUrl" :alt="entry.name" class="desktop-launcher__result-image" />
                <AppIcon v-else :icon="entry.icon" :label="entry.name" />
              </span>
              <span class="desktop-launcher__result-copy">
                <strong>{{ entry.name }}</strong>
                <span>{{ entry.description }}</span>
                <small v-if="entry.meta">{{ entry.meta }}</small>
              </span>
            </button>
          </div>
        </div>

        <p v-if="launcherGroups.length === 0" class="desktop-launcher__empty">
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
          'desktop-window--browser': windowItem.appId === 'browser',
          'desktop-window--focused': windowItem.id === activeWindowId,
          'desktop-window--maximized': windowItem.isMaximized,
        }"
        :style="windowStyle(windowItem)"
        @mousedown="focusWindow(windowItem.id)"
      >
        <header
          v-if="windowItem.appId !== 'browser'"
          class="desktop-window__header"
          @mousedown.stop="startDrag($event, windowItem.id)"
        >
          <div class="desktop-window__title">
            <span>{{ windowItem.title }}.app</span>
          </div>

          <div class="desktop-window__controls">
            <button
              class="desktop-window__control desktop-window__control--minimize"
              type="button"
              aria-label="Minimizar ventana"
              @click.stop="minimizeWindow(windowItem.id)"
            >
              <svg viewBox="0 0 10.2 1" aria-hidden="true"><rect height="1" width="10.2" y="0" x="0"></rect></svg>
            </button>
            <button
              class="desktop-window__control desktop-window__control--maximize"
              type="button"
              aria-label="Maximizar ventana"
              @click.stop="toggleMaximize(windowItem.id)"
            >
              <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z"></path></svg>
            </button>
            <button
              class="desktop-window__control desktop-window__control--close"
              type="button"
              aria-label="Cerrar ventana"
              @click.stop="closeWindow(windowItem.id)"
            >
              <svg viewBox="0 0 10 10" aria-hidden="true"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1"></polygon></svg>
            </button>
          </div>
        </header>

        <div class="desktop-window__body" :class="{ 'desktop-window__body--browser': windowItem.appId === 'browser' }">
          <div v-if="windowItem.appId === 'browser'" class="desktop-browser">
            <div class="desktop-browser__tabs-head" @mousedown.stop="startDrag($event, windowItem.id)">
              <div class="desktop-browser__tabs-list">
                <button
                  v-for="tab in browserTabs"
                  :key="tab.id"
                  class="desktop-browser__tab-open"
                  :class="{ 'desktop-browser__tab-open--active': tab.id === activeBrowserTabId }"
                  type="button"
                  @click="selectBrowserTab(tab.id)"
                >
                  <span class="desktop-browser__tab-name">{{ tab.title }}</span>
                  <span class="desktop-browser__close-tab" @click.stop="closeBrowserTab(tab.id)">✕</span>
                </button>
                <button class="desktop-browser__new-tab" type="button" @click.stop="addBrowserTab()">+</button>
              </div>

              <div class="desktop-browser__window-opt" @mousedown.stop>
                <button type="button" aria-label="Minimizar" @click.stop="minimizeWindow(windowItem.id)">-</button>
                <button type="button" aria-label="Maximizar" @click.stop="toggleMaximize(windowItem.id)">□</button>
                <button class="desktop-browser__window-close" type="button" aria-label="Cerrar" @click.stop="closeWindow(windowItem.id)">✕</button>
              </div>
            </div>

            <div class="desktop-browser__head" @mousedown.stop="startDrag($event, windowItem.id)">
              <button class="desktop-browser__nav-btn" type="button">←</button>
                <button class="desktop-browser__nav-btn" type="button" disabled>→</button>

              <input
                v-model="browserAddressDraft"
                class="desktop-browser__input"
                type="text"
                placeholder="rafex.dev, duckduckgo.com o housedb.rafex.app"
                @keydown.enter.prevent="navigateBrowser"
              />

              <button class="desktop-browser__nav-btn" type="button" @click="navigateBrowser">↵</button>
              <button class="desktop-browser__star" type="button" @click="navigateBrowser">✰</button>
            </div>

            <div class="desktop-browser__viewport">
              <iframe
                v-if="activeBrowserSrc"
                :key="activeBrowserSrc"
                class="desktop-browser__frame"
                :src="activeBrowserSrc"
                title="EtherDesk Browser"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                referrerpolicy="strict-origin-when-cross-origin"
              ></iframe>

              <div v-else class="desktop-browser__page">
                <p class="desktop-browser__page-url">{{ activeBrowserTab?.url }}</p>
                <h3>Navegacion restringida</h3>
                <p>{{ activeBrowserMessage }}</p>
                <p>Sitios permitidos: {{ allowedBrowserHostsLabel }}.</p>
              </div>
            </div>
          </div>

          <div v-else-if="windowItem.appId === 'tars-chat'" class="desktop-chat">
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

          <div v-else-if="windowItem.appId === 'settings'" class="desktop-settings">
            <section class="desktop-settings__section">
              <div class="desktop-settings__section-head">
                <p class="desktop-window__eyebrow">Appearance</p>
                <h2>Configuracion del escritorio</h2>
              </div>

              <div class="desktop-settings__group">
                <span class="desktop-settings__label">Tema</span>
                <div class="desktop-settings__choices">
                  <button
                    class="desktop-settings__choice"
                    :class="{ 'desktop-settings__choice--active': !isAltTheme }"
                    type="button"
                    @click="setThemeMode(false)"
                  >
                    Oceano
                  </button>
                  <button
                    class="desktop-settings__choice"
                    :class="{ 'desktop-settings__choice--active': isAltTheme }"
                    type="button"
                    @click="setThemeMode(true)"
                  >
                    Arena
                  </button>
                </div>
              </div>

              <div class="desktop-settings__group">
                <span class="desktop-settings__label">Fondo de pantalla</span>
                <div class="desktop-settings__choices">
                  <button
                    v-for="option in wallpaperOptions"
                    :key="option.id"
                    class="desktop-settings__choice desktop-settings__choice--wallpaper"
                    :class="{ 'desktop-settings__choice--active': wallpaperVariant === option.id }"
                    type="button"
                    @click="setWallpaper(option.id)"
                  >
                    <span class="desktop-settings__swatch" :class="`desktop-settings__swatch--${option.id}`"></span>
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div class="desktop-settings__group">
                <span class="desktop-settings__label">Dominios permitidos del browser</span>
                <label class="desktop-settings__field">
                  <span>Hosts separados por coma</span>
                  <input v-model="browserHostsDraft" type="text" placeholder="rafex.dev, duckduckgo.com, housedb.rafex.app" />
                </label>
                <div class="desktop-settings__actions">
                  <button class="desktop-settings__save" type="button" :disabled="isSavingPreferences" @click="saveBrowserHosts">
                    {{ isSavingPreferences ? 'Guardando...' : 'Guardar dominios del browser' }}
                  </button>
                </div>
              </div>

              <div class="desktop-settings__group">
                <span class="desktop-settings__label">Tamano por defecto de ventanas</span>
                <label class="desktop-settings__field">
                  <span>Ancho (px)</span>
                  <input v-model.number="windowDefaultsDraft.width" type="number" :min="MIN_WINDOW_WIDTH" step="10" />
                </label>
                <label class="desktop-settings__field">
                  <span>Alto (px)</span>
                  <input v-model.number="windowDefaultsDraft.height" type="number" :min="MIN_WINDOW_HEIGHT" step="10" />
                </label>
                <div class="desktop-settings__actions">
                  <button class="desktop-settings__save" type="button" :disabled="isSavingPreferences" @click="saveWindowDefaults">
                    {{ isSavingPreferences ? 'Guardando...' : 'Guardar tamano por defecto' }}
                  </button>
                </div>
              </div>
            </section>

            <section class="desktop-settings__section">
              <div class="desktop-settings__section-head">
                <p class="desktop-window__eyebrow">Profile</p>
                <h2>Datos del usuario</h2>
              </div>

              <label class="desktop-settings__field">
                <span>Nombre</span>
                <input v-model="profileDraft.name" type="text" />
              </label>

              <label class="desktop-settings__field">
                <span>Correo</span>
                <input v-model="profileDraft.email" type="email" />
              </label>

              <div class="desktop-settings__actions">
                <button class="desktop-settings__save" type="button" @click="saveProfileSettings">
                  Guardar cambios
                </button>
                <button
                  class="desktop-settings__reset"
                  type="button"
                  :disabled="isResettingAppData"
                  @click="resetAppData"
                >
                  {{ isResettingAppData ? 'Reiniciando...' : 'Reiniciar datos y config' }}
                </button>
              </div>
            </section>
          </div>

          <div v-else-if="windowItem.appId === 'notes'" class="desktop-app-surface">
            <NotesEditor :file-id="activeNotesFileId" :file-name="activeNotesFileName" :theme-mode="isAltTheme ? 'sand' : 'ocean'" />
          </div>

          <div v-else-if="windowItem.appId === 'ide'" class="desktop-app-surface">
            <IdeEditor :file-id="activeNotesFileId" :file-name="activeNotesFileName" :theme-mode="isAltTheme ? 'sand' : 'ocean'" />
          </div>

          <div v-else-if="windowItem.appId === 'terminal'" class="desktop-app-surface">
            <TerminalPane
              :apps="props.apps.map((app) => app.name)"
              :execute-command="executeTerminalCommand"
              :session-id="activeTerminalFileId"
              :session-name="activeTerminalFileName"
              :theme-mode="isAltTheme ? 'sand' : 'ocean'"
              :user-name="profileDraft.name"
              :after-command="refreshMonitor"
            />
          </div>

          <div v-else-if="windowItem.appId === 'notification-center'" class="desktop-notification-center">
            <div class="desktop-notification-center__header">
              <p class="desktop-window__eyebrow">Inbox</p>
              <h2>Ultimas notificaciones</h2>
            </div>

            <div class="desktop-notification-center__list">
              <button
                v-for="group in groupedRecentNotifications"
                :key="group.id"
                class="desktop-notification-center__item"
                :class="`desktop-notification-center__item--${group.kind}`"
                type="button"
                @click="openNotificationTarget(group.sourceId, group.targetAppId, group.targetUrl)"
              >
                <div class="desktop-notification-center__item-head">
                  <strong>{{ group.title }}</strong>
                  <span>{{ formatNotificationTime(group.createdAt) }}</span>
                </div>
                <p>{{ group.description }}</p>
                <div class="desktop-notification-center__meta">
                  <span>{{ group.sourceLabel }}</span>
                  <span v-if="group.count > 1">{{ group.count }} eventos</span>
                </div>
              </button>

              <p v-if="groupedRecentNotifications.length === 0" class="desktop-notification-center__empty">
                No hay notificaciones recientes.
              </p>
            </div>
          </div>

          <div v-else-if="windowItem.appId === 'service-alert'" class="desktop-service-alert">
            <p class="desktop-window__eyebrow">Service Alert</p>
            <h2>{{ windowItem.title }}</h2>
            <p>{{ windowItem.description }}</p>
            <div class="desktop-service-alert__actions">
              <button class="desktop-service-alert__button" type="button" @click="closeWindow(windowItem.id)">
                Entendido
              </button>
            </div>
          </div>

          <div v-else-if="windowItem.appId === 'files'" class="desktop-files">
            <div class="desktop-files__header">
              <div>
                <p class="desktop-window__eyebrow">Workspace</p>
                <h2>Archivos locales</h2>
              </div>
              <div class="desktop-settings__actions">
                <button type="button" @click="createWorkspaceFile('notes')">Nuevo note</button>
                <button type="button" @click="createWorkspaceFile('terminal')">Nueva sesion</button>
              </div>
            </div>
            <div class="desktop-files__list">
              <article
                v-for="file in fileEntries"
                :key="file.id"
                class="desktop-files__item"
                :class="{ 'desktop-files__item--muted': !file.exists }"
              >
                <div class="desktop-files__item-main">
                  <AppIcon :icon="file.type" :label="file.name" />
                  <div>
                    <strong>{{ file.name }}</strong>
                    <span>{{ file.exists ? `Actualizado ${formatNotificationTime(file.updatedAt)}` : 'Sin contenido local todavia' }}</span>
                  </div>
                </div>
                <div class="desktop-files__actions">
                  <button v-if="file.type === 'notes'" type="button" :disabled="!file.exists" @click="openLocalFile(file.id, 'notes')">Notes</button>
                  <button v-if="file.type === 'notes'" type="button" :disabled="!file.exists" @click="openLocalFile(file.id, 'ide')">IDE</button>
                  <button v-if="file.type === 'terminal'" type="button" :disabled="!file.exists" @click="openLocalFile(file.id, 'terminal')">Abrir</button>
                  <button type="button" @click="duplicateLocalFile(file.id)">Duplicar</button>
                  <button type="button" @click="renameLocalFile(file.id)">Renombrar</button>
                  <button type="button" :disabled="!file.exists" @click="deleteLocalFile(file.id)">Borrar</button>
                </div>
              </article>
            </div>
          </div>

          <div v-else-if="windowItem.appId === 'system-monitor'" class="desktop-monitor">
            <div class="desktop-monitor__grid">
              <article class="desktop-monitor__card">
                <span>Red</span>
                <strong>{{ isOnline ? 'Online' : 'Offline' }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>Sincronizaciones pendientes</span>
                <strong>{{ pendingTaskGroups.reduce((total, item) => total + item.count, 0) }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>Kernel</span>
                <strong>{{ props.monitorState?.kernel.name ?? 'etherdesk-kernel' }} {{ props.monitorState?.kernel.version ?? props.osVersion }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>Sesion</span>
                <strong>{{ profileDraft.email }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>Service Worker</span>
                <strong>{{ serviceWorkerStatus }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>PWA</span>
                <strong>{{ displayModeLabel }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>Archivos sincronizados</span>
                <strong>{{ props.monitorState?.metrics.files ?? backendFiles.length }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>Eventos del kernel</span>
                <strong>{{ props.monitorState?.metrics.events ?? monitorEvents.length }}</strong>
              </article>
              <article class="desktop-monitor__card">
                <span>Apps registradas</span>
                <strong>{{ props.monitorState?.metrics.registeredApps ?? props.apps.length }}</strong>
              </article>
            </div>
            <div class="desktop-settings__actions desktop-settings__actions--monitor">
              <button class="desktop-settings__save" type="button" @click="refreshMonitor">Actualizar monitor</button>
            </div>
          </div>

          <div v-else-if="windowItem.appId === 'account'" class="desktop-account">
            <p class="desktop-window__eyebrow">Profile</p>
            <div class="desktop-account__hero">
              <img class="desktop-account__avatar" :src="userAvatarUrl" :alt="profileDraft.name" />
              <div>
                <h2>{{ profileDraft.name }}</h2>
                <p>{{ profileDraft.email }}</p>
                <p>EtherDesk OS {{ props.osVersion }}</p>
                <p>Sesion expira: {{ sessionExpirationLabel }}</p>
              </div>
            </div>
            <div class="desktop-account__actions">
              <button type="button" @click="$emit('logout')">Cerrar sesion</button>
            </div>
          </div>

          <div v-else-if="windowItem.appId === 'tasks'" class="desktop-tasks">
            <p class="desktop-window__eyebrow">Queue</p>
            <h2>Tareas pendientes</h2>
            <div class="desktop-tasks__list">
              <article v-for="task in pendingTaskGroups" :key="task.type" class="desktop-tasks__item">
                <strong>{{ task.type }}</strong>
                <span>{{ task.count }} pendiente(s)</span>
              </article>
              <article v-for="event in monitorEvents.slice(0, 5)" :key="event.id" class="desktop-tasks__item">
                <strong>{{ event.type }}</strong>
                <span>{{ event.message }}</span>
              </article>
              <p v-if="pendingTaskGroups.length === 0 && monitorEvents.length === 0" class="desktop-tasks__empty">No hay trabajos pendientes por sincronizar.</p>
            </div>
          </div>

          <div v-else-if="windowItem.appId === 'help'" class="desktop-help">
            <p class="desktop-window__eyebrow">Guide</p>
            <h2>Ayuda rapida</h2>
            <ul class="desktop-help__list">
              <li>`Cmd/Ctrl + K` abre el launcher</li>
              <li>El browser solo permite los hosts configurados por el sistema</li>
              <li>Notes y Terminal guardan localmente si estas offline</li>
              <li>Las tareas pendientes se ven en `Tasks`</li>
              <li>Usa `Settings` para resetear datos de la PWA</li>
            </ul>
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

        <div
          v-if="!windowItem.isMaximized"
          class="desktop-window__resize-handle desktop-window__resize-handle--right"
          @mousedown.stop="startResize($event, windowItem.id, 'right')"
        ></div>
        <div
          v-if="!windowItem.isMaximized"
          class="desktop-window__resize-handle desktop-window__resize-handle--bottom"
          @mousedown.stop="startResize($event, windowItem.id, 'bottom')"
        ></div>
        <div
          v-if="!windowItem.isMaximized"
          class="desktop-window__resize-handle desktop-window__resize-handle--corner"
          @mousedown.stop="startResize($event, windowItem.id, 'corner')"
        ></div>
      </article>
    </section>

    <ul v-if="minimizedWindows.length > 0" class="desktop-minimized-dock" aria-label="Ventanas minimizadas">
      <li v-for="windowItem in minimizedWindows" :key="windowItem.id" class="desktop-minimized-dock__item">
        <button
          class="desktop-minimized-dock__button"
          type="button"
          :aria-label="`Restaurar ${windowItem.title}`"
          @click.stop="restoreWindow(windowItem.id)"
        >
          <span class="desktop-minimized-dock__filled"></span>
          <span class="desktop-minimized-dock__icon">
            <AppIcon :icon="windowIcon(windowItem)" :label="windowItem.appName" />
          </span>
        </button>
        <div class="desktop-minimized-dock__tooltip">{{ windowItem.title }}</div>
      </li>
    </ul>

    <section class="desktop-notifications" aria-label="Notificaciones del sistema">
      <article
        v-for="notification in toastNotifications"
        :key="notification.id"
        class="desktop-notification"
        :class="`desktop-notification--${notification.kind}`"
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

    <div class="desktop-version">
      <span>EtherDesk OS</span>
      <strong>{{ props.osVersion }}</strong>
    </div>

    <div class="desktop-rating" aria-label="Calificacion del sistema">
      <button
        v-for="value in ratingOptions"
        :key="value"
        class="desktop-rating__button"
        :class="{ 'desktop-rating__button--active': value <= activeRatingValue }"
        type="button"
        :aria-label="`${value} estrella${value === 1 ? '' : 's'}`"
        @click="setDesktopRating(value)"
      >
        ★
      </button>
    </div>

    <section v-if="feedbackDialog.visible" class="desktop-feedback" @click.self="closeFeedbackDialog">
      <div class="desktop-feedback__panel">
        <p class="desktop-window__eyebrow">Feedback</p>
        <h2>{{ feedbackDialog.rating }}/5 estrellas</h2>
        <p>
          {{ feedbackDialog.rating <= 2 ? 'Cuentanos que no funciono bien.' : feedbackDialog.rating === 3 ? 'Que te parecio regular o mejorable?' : 'Que fue lo que mas te gusto?' }}
        </p>

        <div class="desktop-feedback__chips">
          <button
            v-for="chip in feedbackChipOptions"
            :key="chip"
            class="desktop-feedback__chip"
            :class="{ 'desktop-feedback__chip--active': feedbackDialog.selectedChips.includes(chip) }"
            type="button"
            @click="toggleFeedbackChip(chip)"
          >
            {{ chip }}
          </button>
        </div>

        <textarea
          v-model="feedbackDialog.comment"
          class="desktop-feedback__textarea"
          placeholder="Agrega mas contexto sobre tu experiencia..."
        ></textarea>

        <div class="desktop-feedback__actions">
          <button type="button" @click="closeFeedbackDialog">Cancelar</button>
          <button type="button" @click="submitFeedback">Enviar feedback</button>
        </div>
      </div>
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
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AppIcon from '@/shared/AppIcon.vue';
import { addOfflineStateListener, readNotesDraft, readOfflineQueue, readTerminalSnapshot, removeNotesDraft, removeTerminalSnapshot } from '@/os/offline';
import type { AppShortcut, DesktopPreferences, FeedbackSubmission, KernelMonitorState, ServiceAlert } from '@/shared/types';

const NotesEditor = defineAsyncComponent(() => import('@/editor/NotesEditor.vue'));
const IdeEditor = defineAsyncComponent(() => import('@/editor/IdeEditor.vue'));
const TerminalPane = defineAsyncComponent(() => import('@/terminal/TerminalPane.vue'));

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
  metadata?: {
    alertId?: number;
  };
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
  kind: 'success' | 'info' | 'warning' | 'error';
  sourceId: string;
  sourceLabel: string;
  createdAt: string;
  isToastVisible: boolean;
  targetAppId?: string;
  targetUrl?: string;
}

interface ChatMessage {
  id: number;
  author: 'user' | 'assistant';
  text: string;
  time: string;
}

interface LauncherEntry {
  id: string;
  name: string;
  description: string;
  icon: string;
  appId: string;
  route?: string;
  targetUrl?: string;
  iconUrl?: string;
  meta?: string;
  group: 'apps' | 'web';
}

interface FeedbackDialogState {
  visible: boolean;
  rating: number;
  comment: string;
  selectedChips: string[];
}

interface LocalFileItem {
  id: string;
  name: string;
  type: 'notes' | 'terminal';
  updatedAt: string;
  exists: boolean;
}

type ResizeDirection = 'right' | 'bottom' | 'corner';

interface BrowserTab {
  id: number;
  title: string;
  url: string;
}

type WallpaperVariant = 'ocean' | 'sunset' | 'graphite';

const WINDOW_WIDTH = 440;
const WINDOW_HEIGHT = 320;
const MAXIMIZED_MARGIN = 18;
const MAXIMIZED_TOP_OFFSET = 43;
const MIN_WINDOW_WIDTH = 320;
const MIN_WINDOW_HEIGHT = 220;
const WINDOW_DEFAULTS_STORAGE_KEY = 'etherdesk.settings.window-defaults';

const props = defineProps<{
  apps: AppShortcut[];
  userName: string;
  userEmail: string;
  initialRating: number;
  osVersion: string;
  preferences: DesktopPreferences | null;
  monitorState: KernelMonitorState | null;
  sessionExpiresAt: string | null;
  serviceAlerts: ServiceAlert[];
  executeTerminalCommand: (command: string) => Promise<{ ok: boolean; output: string[] }>;
  updateProfile: (name: string, email: string) => Promise<{ id: string; name: string; email: string; role: string }>;
  createWorkspaceFile: (type: 'notes' | 'terminal', name: string) => Promise<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string } | null>;
  activateWorkspaceFile: (fileId: string) => Promise<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string }>;
  duplicateWorkspaceFile: (fileId: string) => Promise<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string }>;
  renameWorkspaceFile: (fileId: string, name: string) => Promise<{ id: string; name: string; type: 'notes' | 'terminal'; updatedAt: string }>;
  deleteWorkspaceFile: (fileId: string) => Promise<{ success: boolean }>;
}>();

const emit = defineEmits<{
  logout: [];
  rate: [feedback: FeedbackSubmission];
  'update-preferences': [patch: Partial<DesktopPreferences>];
  'consume-service-alert': [alertId: number];
  'refresh-monitor': [];
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
const wallpaperVariant = ref<WallpaperVariant>('ocean');
const isLauncherOpen = ref(false);
const launcherQuery = ref('');
const desktopRating = ref(props.initialRating);
const feedbackDialog = ref<FeedbackDialogState>({
  visible: false,
  rating: 0,
  comment: '',
  selectedChips: [],
});
const ratingOptions = [1, 2, 3, 4, 5];
const nextBrowserTabId = ref(3);
const browserTabs = ref<BrowserTab[]>([
  { id: 1, title: 'Rafex', url: 'rafex.dev' },
  { id: 2, title: 'DuckDuckGo', url: 'duckduckgo.com' },
]);
const activeBrowserTabId = ref(1);
const browserAddressDraft = ref('rafex.dev');
const profileDraft = ref({
  name: props.userName,
  email: props.userEmail,
});
const windowDefaultsDraft = ref(readStoredWindowDefaults());
const browserHostsDraft = ref('');
const wallpaperOptions: Array<{ id: WallpaperVariant; label: string }> = [
  { id: 'ocean', label: 'Oceano' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'graphite', label: 'Graphite' },
];
const launcherTime = ref('');
const launcherDate = ref('');
const nextChatMessageId = ref(5);
const chatDraft = ref('');
const isResettingAppData = ref(false);
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
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
    description: 'El escritorio esta listo. Puedes abrir apps desde el launcher, mover ventanas y usar clic derecho sobre el fondo.',
    x: 64,
    y: 56,
    width: 500,
    height: 320,
    zIndex: 3,
    isMinimized: false,
    isMaximized: false,
  },
]);
const fileEntries = ref<LocalFileItem[]>([]);
const offlineStateTick = ref(0);
const isSavingPreferences = ref(false);

const visibleWindows = computed(() => windows.value.filter((windowItem) => !windowItem.isMinimized));
const minimizedWindows = computed(() => windows.value.filter((windowItem) => windowItem.isMinimized));
const toastNotifications = computed(() => notifications.value.filter((item) => item.isToastVisible).slice(0, 3));
const activeBrowserTab = computed(() => {
  return browserTabs.value.find((tab) => tab.id === activeBrowserTabId.value) ?? browserTabs.value[0] ?? null;
});
const activeBrowserSrc = computed(() => {
  const url = activeBrowserTab.value?.url ?? '';
  return resolveAllowedBrowserUrl(url);
});
const allowedBrowserHostsLabel = computed(() => {
  const browserApp = props.apps.find((app) => app.id === 'browser');
  return (browserApp?.allowedHosts ?? ['rafex.dev', 'duckduckgo.com', 'housedb.rafex.app']).join(', ');
});
const activeBrowserMessage = computed(() => {
  const url = activeBrowserTab.value?.url ?? '';

  if (!url.trim()) {
    return 'Ingresa una URL permitida para navegar.';
  }

  return 'Esta URL no esta permitida dentro del navegador de EtherDesk.';
});
const groupedRecentNotifications = computed(() => {
  const recent = notifications.value.slice(0, 7);
  const grouped = new Map<string, { id: string; kind: DesktopNotification['kind']; sourceLabel: string; title: string; description: string; count: number; createdAt: string; targetAppId?: string; targetUrl?: string }>();

  recent.forEach((notification) => {
    const groupKey = `${notification.sourceId}:${notification.kind}`;
    const existing = grouped.get(groupKey);

    if (existing) {
      existing.count += 1;
      existing.title = notification.title;
      existing.description = notification.description;
      existing.createdAt = notification.createdAt;
      existing.targetAppId = notification.targetAppId;
      existing.targetUrl = notification.targetUrl;
      return;
    }

    grouped.set(groupKey, {
      id: groupKey,
      kind: notification.kind,
      sourceLabel: notification.sourceLabel,
      title: notification.title,
      description: notification.description,
      count: 1,
      createdAt: notification.createdAt,
      targetAppId: notification.targetAppId,
      targetUrl: notification.targetUrl,
    });
  });

  return Array.from(grouped.values());
});
const filteredApps = computed(() => {
  const normalizedQuery = launcherQuery.value.trim().toLowerCase();

  if (!normalizedQuery) {
    return props.apps;
  }

  return props.apps.filter((app) => {
    return `${app.name} ${app.description}`.toLowerCase().includes(normalizedQuery);
  });
});
const launcherEntries = computed<LauncherEntry[]>(() => {
  const entries = filteredApps.value.map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    icon: app.icon,
    appId: app.id,
    route: app.route,
    group: 'apps' as const,
  }));
  const normalizedQuery = launcherQuery.value.trim().toLowerCase();
  const browserApp = props.apps.find((app) => app.id === 'browser');
  const allowedHosts = browserApp?.allowedHosts ?? [];
  if (!normalizedQuery) {
    return entries;
  }

  const browserTarget = allowedHosts.find((host) => normalizedQuery.includes(host) || host.includes(normalizedQuery));
  if (browserTarget) {
    const browserTargetMeta = resolveBrowserTargetMeta(browserTarget);
    entries.unshift({
      id: `browser-target-${browserTarget}`,
      name: browserTargetMeta.title,
      description: browserTargetMeta.description,
      icon: browserApp?.icon ?? 'browser',
      appId: 'browser',
      route: browserApp?.route,
      targetUrl: browserTarget,
      iconUrl: browserTargetMeta.iconUrl,
      meta: browserTarget,
      group: 'web' as const,
    });
  }

  return entries;
});
const launcherGroups = computed(() => {
  const appEntries = launcherEntries.value.filter((entry) => entry.group === 'apps');
  const webEntries = launcherEntries.value.filter((entry) => entry.group === 'web');
  const groups: Array<{ id: string; label: string; entries: LauncherEntry[] }> = [];

  if (appEntries.length > 0) {
    groups.push({
      id: 'apps',
      label: 'Apps',
      entries: appEntries,
    });
  }

  if (webEntries.length > 0) {
    groups.push({
      id: 'web',
      label: 'Web permitida',
      entries: webEntries,
    });
  }

  return groups;
});
const activeRatingValue = computed(() => (feedbackDialog.value.visible ? feedbackDialog.value.rating : desktopRating.value));
const feedbackChipOptions = computed(() => {
  const rating = feedbackDialog.value.rating;

  if (rating <= 2) {
    return ['lento', 'no abre', 'confuso', 'fallo offline', 'errores visuales'];
  }

  if (rating === 3) {
    return ['estable', 'puede mejorar', 'faltan apps', 'regular offline', 'visual aceptable'];
  }

  return ['excelente aplicacion', 'increible experiencia de usuario', 'rapido', 'flujo claro', 'muy util offline'];
});
const pendingTaskGroups = computed(() => {
  offlineStateTick.value;
  const queue = readOfflineQueue();
  const groups = new Map<string, number>();

  queue.forEach((item) => {
    groups.set(item.type, (groups.get(item.type) ?? 0) + 1);
  });

  return Array.from(groups.entries()).map(([type, count]) => ({
    type,
    count,
  }));
});
const serviceWorkerStatus = ref('checking');
const displayModeLabel = ref('browser');
const backendFiles = computed(() => props.monitorState?.workspace.files ?? []);
const monitorEvents = computed(() => props.monitorState?.events ?? []);
const sessionExpirationLabel = computed(() => {
  if (!props.sessionExpiresAt) {
    return 'Sin expiracion disponible';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.sessionExpiresAt));
});
const activeNotesFileName = computed(() => props.monitorState?.workspace.notes?.name ?? 'notes.md');
const activeNotesFileId = computed(() => props.monitorState?.workspace.notes?.id ?? 'notes-file');
const activeTerminalFileName = computed(() => props.monitorState?.workspace.terminal?.name ?? 'terminal-session.log');
const activeTerminalFileId = computed(() => props.monitorState?.workspace.terminal?.id ?? 'terminal-file');
const userInitials = computed(() => {
  return profileDraft.value.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((fragment) => fragment.charAt(0).toUpperCase())
    .join('');
});
const userAvatarUrl = computed(() => buildAvatarDataUrl(profileDraft.value.name, userInitials.value));

watch(
  () => props.initialRating,
  (value) => {
    desktopRating.value = value;
  },
);

watch(
  () => [props.userName, props.userEmail],
  ([name, email]) => {
    profileDraft.value = { name, email };
  },
);

watch(
  () => props.preferences,
  (preferences) => {
    if (!preferences) {
      return;
    }

    isAltTheme.value = preferences.theme === 'sand';
    wallpaperVariant.value = preferences.wallpaper;
    windowDefaultsDraft.value = {
      width: preferences.defaultWindowSize.width,
      height: preferences.defaultWindowSize.height,
    };
    browserHostsDraft.value = preferences.browserAllowedHosts.join(', ');
    desktopRating.value = preferences.satisfaction;
  },
  { immediate: true, deep: true },
);

watch(
  activeBrowserTab,
  (tab) => {
    browserAddressDraft.value = tab?.url ?? '';
  },
  { immediate: true },
);

watch(
  () => props.serviceAlerts,
  (alerts) => {
    alerts.forEach((alert) => {
      const hasWindow = windows.value.some((windowItem) => windowItem.metadata?.alertId === alert.id);
      if (hasWindow) {
        return;
      }

      const windowId = `service-alert-${alert.id}`;
      windows.value.push({
        id: windowId,
        appId: 'service-alert',
        appName: 'Service Alert',
        label: 'Alerta',
        title: alert.title,
        description: alert.message,
        x: 110 + windows.value.length * 16,
        y: 86 + windows.value.length * 16,
        width: 420,
        height: 240,
        zIndex: nextZIndex(),
        isMinimized: false,
        isMaximized: false,
        metadata: {
          alertId: alert.id,
        },
      });

      notify(alert.title, alert.message, {
        kind: 'error',
        sourceId: alert.service,
        sourceLabel: alert.service,
      });
      emit('consume-service-alert', alert.id);
    });
  },
  { deep: true },
);

watch(
  () => props.monitorState,
  () => {
    refreshLocalWorkspace();
  },
  { deep: true },
);

let dragState:
  | {
      id: string;
      offsetX: number;
      offsetY: number;
    }
  | null = null;

let resizeState:
  | {
      id: string;
      direction: ResizeDirection;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
    }
  | null = null;
let clockTimer: number | null = null;
let removeOnlineListener: (() => void) | null = null;
let removeOfflineListener: (() => void) | null = null;
let removeOfflineStateListener: (() => void) | null = null;
const hashChangeHandler = () => {
  void handleHashChange();
};

function syncLauncherClock() {
  const now = new Date();
  launcherTime.value = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
  launcherDate.value = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
}

function refreshLocalWorkspace() {
  fileEntries.value = backendFiles.value.map((file) => ({
    id: file.id,
    name: file.name,
    type: file.type,
    updatedAt:
      file.type === 'notes'
        ? readNotesDraft(file.id)?.updatedAt ?? file.updatedAt
        : readTerminalSnapshot(file.id)?.updatedAt ?? file.updatedAt,
    exists: true,
  }));
}

function updateConnectionStatus() {
  isOnline.value = navigator.onLine;
}

async function updateServiceWorkerStatus() {
  if (!('serviceWorker' in navigator)) {
    serviceWorkerStatus.value = 'unsupported';
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  serviceWorkerStatus.value = registrations.length > 0 ? 'active' : 'missing';
}

function updateDisplayMode() {
  displayModeLabel.value = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';
}

async function refreshMonitor() {
  emit('refresh-monitor');
}

async function executeTerminalCommand(command: string) {
  return props.executeTerminalCommand(command);
}

function openFeedbackDialog(value: number) {
  feedbackDialog.value = {
    visible: true,
    rating: value,
    comment: '',
    selectedChips: [],
  };
}

function toggleFeedbackChip(chip: string) {
  const hasChip = feedbackDialog.value.selectedChips.includes(chip);
  feedbackDialog.value.selectedChips = hasChip
    ? feedbackDialog.value.selectedChips.filter((item) => item !== chip)
    : [...feedbackDialog.value.selectedChips, chip];
}

function closeFeedbackDialog() {
  feedbackDialog.value.visible = false;
}

function submitFeedback() {
  const submission: FeedbackSubmission = {
    rating: feedbackDialog.value.rating,
    chips: [...feedbackDialog.value.selectedChips],
    comment: feedbackDialog.value.comment.trim(),
  };

  desktopRating.value = submission.rating;
  emit('rate', submission);
  closeFeedbackDialog();

  notify(
    'Satisfaccion registrada',
    submission.comment
      ? `Calificacion ${submission.rating}/5 registrada con comentario.`
      : `Calificacion actual: ${submission.rating} de 5 estrellas.`,
    {
      kind: 'success',
      sourceId: 'os.feedback',
      sourceLabel: 'Feedback',
    },
  );
}

function renameLocalFile(fileId: string) {
  const file = fileEntries.value.find((item) => item.id === fileId);
  if (!file) {
    return;
  }

  const nextName = window.prompt('Nuevo nombre del archivo', file.name)?.trim();
  if (!nextName) {
    return;
  }

  void props
    .renameWorkspaceFile(file.id, nextName)
    .then(() => {
      refreshLocalWorkspace();
      notify('Archivo renombrado', `${nextName} actualizado en el workspace.`, {
        kind: 'success',
        sourceId: 'files',
        sourceLabel: 'Files',
      });
    })
    .catch((error) => {
      notify(
        'No fue posible renombrar el archivo',
        error instanceof Error ? error.message : 'El backend rechazo la operacion.',
        {
          kind: 'error',
          sourceId: 'files',
          sourceLabel: 'Files',
        },
      );
    });
}

function deleteLocalFile(fileId: string) {
  const file = fileEntries.value.find((item) => item.id === fileId);
  if (!file) {
    return;
  }

  void props
    .deleteWorkspaceFile(file.id)
    .then(() => {
      if (file.type === 'notes') {
        removeNotesDraft(file.id);
      } else if (file.type === 'terminal') {
        removeTerminalSnapshot(file.id);
      }

      refreshLocalWorkspace();
      notify('Archivo eliminado', `${file.name} fue eliminado del workspace.`, {
        kind: 'info',
        sourceId: 'files',
        sourceLabel: 'Files',
      });
    })
    .catch((error) => {
      notify(
        'No fue posible eliminar el archivo',
        error instanceof Error ? error.message : 'El backend rechazo la operacion.',
        {
          kind: 'error',
          sourceId: 'files',
          sourceLabel: 'Files',
        },
      );
    });
}

function duplicateLocalFile(fileId: string) {
  const file = fileEntries.value.find((item) => item.id === fileId);
  if (!file) {
    return;
  }

  void props
    .duplicateWorkspaceFile(file.id)
    .then((duplicate) => {
      refreshLocalWorkspace();
      notify('Archivo duplicado', `${file.name} fue duplicado como ${duplicate.name}.`, {
        kind: 'success',
        sourceId: 'files',
        sourceLabel: 'Files',
      });
    })
    .catch((error) => {
      notify(
        'No fue posible duplicar el archivo',
        error instanceof Error ? error.message : 'El backend rechazo la duplicacion del archivo.',
        {
          kind: 'error',
          sourceId: 'files',
          sourceLabel: 'Files',
        },
      );
    });
}

function setWorkspaceDeepLink(targetAppId: 'notes' | 'ide' | 'terminal', fileId: string) {
  const encodedFileId = encodeURIComponent(fileId);
  const nextHash = `#/${targetAppId}/${encodedFileId}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
}

function setAppRouteHash(route: string) {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  const nextHash = `#${normalizedRoute}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
}

function setBrowserDeepLink(url: string) {
  const encodedUrl = encodeURIComponent(url);
  const nextHash = `#/apps/browser?url=${encodedUrl}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
}

function openBrowserUrl(url: string) {
  const resolvedUrl = resolveAllowedBrowserUrl(url);
  if (!resolvedUrl) {
    const browserApp = props.apps.find((app) => app.id === 'browser');
    const allowedHosts = (browserApp?.allowedHosts ?? []).join(', ');
    notify('Navegacion bloqueada', `El navegador solo permite ${allowedHosts || 'hosts configurados por el sistema'}.`, {
      kind: 'warning',
      sourceId: 'browser',
      sourceLabel: 'Browser',
    });
    return false;
  }

  const currentTab = activeBrowserTab.value;
  if (!currentTab) {
    return false;
  }

  currentTab.url = url.trim();
  currentTab.title = deriveBrowserTitle(url);
  browserAddressDraft.value = currentTab.url;
  setBrowserDeepLink(currentTab.url);
  openAppWindow('browser');
  notify('Browser', `Cargando ${currentTab.title}.`, {
    kind: 'info',
    sourceId: 'browser',
    sourceLabel: 'Browser',
    targetAppId: 'browser',
    targetUrl: currentTab.url,
  });
  return true;
}

function openLocalFile(fileId: string, targetAppId: 'notes' | 'ide' | 'terminal') {
  const file = fileEntries.value.find((item) => item.id === fileId);
  if (!file) {
    return;
  }

  void props
    .activateWorkspaceFile(file.id)
    .then(() => {
      refreshLocalWorkspace();
      setWorkspaceDeepLink(targetAppId, file.id);
      openAppWindow(targetAppId);
      notify('Archivo activado', `${file.name} se abrio en ${targetAppId === 'ide' ? 'IDE' : targetAppId === 'notes' ? 'Notes' : 'Terminal'}.`, {
        kind: 'info',
        sourceId: 'files',
        sourceLabel: 'Files',
      });
    })
    .catch((error) => {
      notify(
        'No fue posible abrir el archivo',
        error instanceof Error ? error.message : 'El backend rechazo la activacion del archivo.',
        {
          kind: 'error',
          sourceId: 'files',
          sourceLabel: 'Files',
        },
      );
    });
}

function buildAvatarDataUrl(name: string, initials: string) {
  const normalizedName = name.trim() || 'EtherDesk';
  const seed = normalizedName.split('').reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
  const firstHue = seed % 360;
  const secondHue = (seed + 48) % 360;
  const safeInitials = initials || 'ED';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${normalizedName}">
      <defs>
        <linearGradient id="avatar-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="hsl(${firstHue} 78% 64%)" />
          <stop offset="100%" stop-color="hsl(${secondHue} 68% 48%)" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="24" fill="url(#avatar-gradient)" />
      <circle cx="48" cy="36" r="14" fill="rgba(255,255,255,0.24)" />
      <path d="M22 79c4-14 15-22 26-22s22 8 26 22" fill="rgba(255,255,255,0.2)" />
      <text x="48" y="55" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="white">${safeInitials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildHostIconDataUrl(host: string, label: string, background: string) {
  const safeLabel = label.slice(0, 3).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="${host}">
      <rect width="48" height="48" rx="14" fill="${background}" />
      <text x="24" y="29" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="white">${safeLabel}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolveBrowserTargetMeta(host: string) {
  const browserTargets: Record<string, { title: string; description: string; iconUrl: string }> = {
    'rafex.dev': {
      title: 'Rafex',
      description: 'Sitio principal del autor dentro del browser permitido.',
      iconUrl: buildHostIconDataUrl('rafex.dev', 'R', '#2563eb'),
    },
    'duckduckgo.com': {
      title: 'DuckDuckGo',
      description: 'Buscador permitido para navegacion dentro del desktop.',
      iconUrl: buildHostIconDataUrl('duckduckgo.com', 'DDG', '#ea580c'),
    },
    'housedb.rafex.app': {
      title: 'HouseDB',
      description: 'Acceso permitido al sistema HouseDB desde EtherDesk.',
      iconUrl: buildHostIconDataUrl('housedb.rafex.app', 'HDB', '#0891b2'),
    },
  };

  return (
    browserTargets[host] ?? {
      title: host,
      description: 'Host permitido para el navegador del sistema.',
      iconUrl: buildHostIconDataUrl(host, host.slice(0, 2), '#475569'),
    }
  );
}

function readStoredWindowDefaults() {
  if (typeof window === 'undefined') {
    return {
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
    };
  }

  try {
    const rawValue = window.localStorage.getItem(WINDOW_DEFAULTS_STORAGE_KEY);
    if (!rawValue) {
      return {
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
      };
    }

    const parsed = JSON.parse(rawValue) as { width?: number; height?: number };
    return {
      width: Math.max(MIN_WINDOW_WIDTH, Number(parsed.width ?? WINDOW_WIDTH)),
      height: Math.max(MIN_WINDOW_HEIGHT, Number(parsed.height ?? WINDOW_HEIGHT)),
    };
  } catch {
    return {
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
    };
  }
}

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
    width: windowDefaultsDraft.value.width,
    height: windowDefaultsDraft.value.height,
    zIndex: nextZIndex(),
    isMinimized: false,
    isMaximized: false,
  };
}

function buildSpecialWindow(config: {
  id: string;
  appId: string;
  appName: string;
  title: string;
  description: string;
  width?: number;
  height?: number;
  metadata?: DesktopWindow['metadata'];
}) {
  const offset = windows.value.length * 18;

  return {
    id: config.id,
    appId: config.appId,
    appName: config.appName,
    label: 'Sistema',
    title: config.title,
    description: config.description,
    x: 92 + offset,
    y: 84 + offset,
    width: config.width ?? windowDefaultsDraft.value.width,
    height: config.height ?? windowDefaultsDraft.value.height,
    zIndex: nextZIndex(),
    isMinimized: false,
    isMaximized: false,
    metadata: config.metadata,
  } satisfies DesktopWindow;
}

function openAppWindow(appId: string) {
  closeContextMenu();
  closeLauncher();

  const existingWindow = windows.value.find((windowItem) => windowItem.appId === appId);
  if (existingWindow) {
    existingWindow.isMinimized = false;
    focusWindow(existingWindow.id);
    notify('App restaurada', `${existingWindow.appName} volvio al escritorio.`, {
      kind: 'info',
      sourceId: existingWindow.appId,
      sourceLabel: existingWindow.appName,
    });
    return;
  }

  const app = props.apps.find((item) => item.id === appId);
  if (!app) {
    return;
  }

  const windowItem = buildWindow(app);
  windows.value.push(windowItem);
  activeWindowId.value = windowItem.id;
  notify('App abierta', `${app.name} se agrego al escritorio.`, {
    kind: 'success',
    sourceId: app.id,
    sourceLabel: app.name,
  });
}

function openNotificationCenter() {
  closeContextMenu();
  closeLauncher();

  const existingWindow = windows.value.find((windowItem) => windowItem.appId === 'notification-center');
  if (existingWindow) {
    existingWindow.isMinimized = false;
    focusWindow(existingWindow.id);
    return;
  }

  const windowItem = buildSpecialWindow({
    id: 'notification-center',
    appId: 'notification-center',
    appName: 'Notifications',
    title: 'Notifications',
    description: 'Historial de notificaciones del sistema.',
    width: 460,
    height: 380,
  });

  windows.value.push(windowItem);
  activeWindowId.value = windowItem.id;
}

function minimizeWindow(windowId: string) {
  const windowItem = windows.value.find((item) => item.id === windowId);
  if (!windowItem) {
    return;
  }

  windowItem.isMinimized = true;
  notify('Ventana minimizada', `${windowItem.appName} se envio al area de minimizadas.`, {
    kind: 'info',
    sourceId: windowItem.appId,
    sourceLabel: windowItem.appName,
  });

  const fallbackWindow = visibleWindows.value.find((item) => item.id !== windowId);
  activeWindowId.value = fallbackWindow?.id ?? '';
}

function restoreWindow(windowId: string) {
  const windowItem = windows.value.find((item) => item.id === windowId);
  if (!windowItem) {
    return;
  }

  windowItem.isMinimized = false;
  focusWindow(windowId);
  notify('Ventana restaurada', `${windowItem.appName} volvio al escritorio.`, {
    kind: 'info',
    sourceId: windowItem.appId,
    sourceLabel: windowItem.appName,
  });
}

function closeWindow(windowId: string) {
  const windowItem = windows.value.find((item) => item.id === windowId);
  if (!windowItem) {
    return;
  }

  windows.value = windows.value.filter((item) => item.id !== windowId);

  const fallbackWindow = windows.value.find((item) => !item.isMinimized);
  activeWindowId.value = fallbackWindow?.id ?? '';
  notify('Ventana cerrada', `${windowItem.appName} se cerro.`, {
    kind: 'info',
    sourceId: windowItem.appId,
    sourceLabel: windowItem.appName,
  });
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
    {
      kind: 'info',
      sourceId: windowItem.appId,
      sourceLabel: windowItem.appName,
    },
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
  notify('Ventanas restauradas', 'Todas las ventanas visibles volvieron al escritorio.', {
    kind: 'info',
    sourceId: 'system',
    sourceLabel: 'System',
  });
}

function isAppOpen(appId: string) {
  return windows.value.some((windowItem) => windowItem.appId === appId && !windowItem.isMinimized);
}

function windowIcon(windowItem: DesktopWindow) {
  if (windowItem.appId === 'system') {
    return 'system';
  }

  const app = props.apps.find((item) => item.id === windowItem.appId);
  return app?.icon ?? 'system';
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

function launchFromLauncher(app: AppShortcut, targetUrl?: string) {
  if (app.id === 'browser' && targetUrl) {
    void openBrowserUrl(targetUrl);
    notify('Launcher', 'Aplicacion abierta desde el launcher.', {
      kind: 'success',
      sourceId: 'launcher',
      sourceLabel: 'Launcher',
      targetAppId: 'browser',
      targetUrl,
    });
    return;
  } else if (app.id === 'ide' && activeNotesFileId.value) {
    setWorkspaceDeepLink('ide', activeNotesFileId.value);
  } else {
    setAppRouteHash(app.route ?? `/apps/${app.id}`);
  }

  openAppWindow(app.id);
  notify('Launcher', 'Aplicacion abierta desde el launcher.', {
    kind: 'success',
    sourceId: 'launcher',
    sourceLabel: 'Launcher',
  });
}

function launchLauncherEntry(entry: LauncherEntry) {
  const app = props.apps.find((item) => item.id === entry.appId);
  if (!app) {
    return;
  }

  launchFromLauncher(app, entry.targetUrl);
}

function openNotificationTarget(sourceId: string, targetAppId?: string, targetUrl?: string) {
  const app = props.apps.find((item) => item.id === (targetAppId ?? sourceId));
  if (!app) {
    return;
  }

  launchFromLauncher(app, targetUrl);
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

function startResize(event: MouseEvent, windowId: string, direction: ResizeDirection) {
  const windowItem = windows.value.find((item) => item.id === windowId);
  if (!windowItem || windowItem.isMaximized) {
    return;
  }

  focusWindow(windowId);

  resizeState = {
    id: windowId,
    direction,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: windowItem.width,
    startHeight: windowItem.height,
  };
}

function windowStyle(windowItem: DesktopWindow) {
  if (windowItem.isMaximized) {
    return {
      inset: `${MAXIMIZED_TOP_OFFSET}px ${MAXIMIZED_MARGIN}px ${MAXIMIZED_MARGIN}px ${MAXIMIZED_MARGIN}px`,
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

function selectBrowserTab(tabId: number) {
  activeBrowserTabId.value = tabId;
}

function addBrowserTab() {
  const id = nextBrowserTabId.value++;
  browserTabs.value.push({
    id,
    title: 'Rafex',
    url: 'rafex.dev',
  });
  activeBrowserTabId.value = id;
}

function closeBrowserTab(tabId: number) {
  if (browserTabs.value.length === 1) {
    browserTabs.value[0] = {
      id: browserTabs.value[0].id,
      title: 'Rafex',
      url: 'rafex.dev',
    };
    activeBrowserTabId.value = browserTabs.value[0].id;
    return;
  }

  browserTabs.value = browserTabs.value.filter((tab) => tab.id !== tabId);

  if (activeBrowserTabId.value === tabId) {
    activeBrowserTabId.value = browserTabs.value[0]?.id ?? 0;
  }
}

function navigateBrowser() {
  void openBrowserUrl(browserAddressDraft.value.trim());
}

function deriveBrowserTitle(url: string) {
  const normalized = url.trim();
  if (!normalized) {
    return 'New Tab';
  }

  const hostname = normalized
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split('.')[0];

  return hostname ? hostname.charAt(0).toUpperCase() + hostname.slice(1) : 'New Tab';
}

function resolveAllowedBrowserUrl(url: string) {
  const browserApp = props.apps.find((app) => app.id === 'browser');
  const allowedHosts = browserApp?.allowedHosts ?? ['rafex.dev', 'duckduckgo.com', 'housedb.rafex.app'];
  const normalized = url.trim();
  if (!normalized) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;

  try {
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const isAllowed = allowedHosts.includes(hostname);

    if (!isAllowed) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function notify(
  title: string,
  description: string,
  options: {
    kind?: DesktopNotification['kind'];
    sourceId?: string;
    sourceLabel?: string;
    targetAppId?: string;
    targetUrl?: string;
  } = {},
) {
  const id = nextNotificationId.value;
  nextNotificationId.value += 1;

  notifications.value.unshift({
    id,
    title,
    description,
    kind: options.kind ?? 'info',
    sourceId: options.sourceId ?? 'system',
    sourceLabel: options.sourceLabel ?? 'System',
    createdAt: new Date().toISOString(),
    isToastVisible: true,
    targetAppId: options.targetAppId,
    targetUrl: options.targetUrl,
  });

  notifications.value = notifications.value.slice(0, 30);

  window.setTimeout(() => {
    dismissNotification(id);
  }, 3200);
}

function dismissNotification(notificationId: number) {
  const notification = notifications.value.find((item) => item.id === notificationId);
  if (notification) {
    notification.isToastVisible = false;
  }
}

function setDesktopRating(value: number) {
  openFeedbackDialog(value);
}

async function persistPreferences(patch: Partial<DesktopPreferences>) {
  isSavingPreferences.value = true;

  try {
    emit('update-preferences', patch);
  } finally {
    window.setTimeout(() => {
      isSavingPreferences.value = false;
    }, 250);
  }
}

function handleThemeToggle() {
  notify(
    'Tema actualizado',
    isAltTheme.value ? 'El sistema cambio a la paleta nocturna.' : 'El sistema volvio a la paleta oceano.',
    {
      kind: 'success',
      sourceId: 'settings',
      sourceLabel: 'Settings',
    },
  );
}

function toggleTheme() {
  isAltTheme.value = !isAltTheme.value;
  void persistPreferences({
    theme: isAltTheme.value ? 'sand' : 'ocean',
  });
  handleThemeToggle();
}

function setThemeMode(value: boolean) {
  if (isAltTheme.value === value) {
    return;
  }

  isAltTheme.value = value;
  void persistPreferences({
    theme: value ? 'sand' : 'ocean',
  });
  handleThemeToggle();
}

function setWallpaper(value: WallpaperVariant) {
  if (wallpaperVariant.value === value) {
    return;
  }

  wallpaperVariant.value = value;
  void persistPreferences({
    wallpaper: value,
  });
  notify('Wallpaper actualizado', `El fondo cambio a ${value}.`, {
    kind: 'success',
    sourceId: 'settings',
    sourceLabel: 'Settings',
  });
}

function saveBrowserHosts() {
  const hosts = browserHostsDraft.value
    .split(',')
    .map((item) => item.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''))
    .filter(Boolean);

  if (hosts.length === 0) {
    notify('Dominios invalidos', 'Debes capturar al menos un host permitido para el browser.', {
      kind: 'warning',
      sourceId: 'settings',
      sourceLabel: 'Settings',
    });
    return;
  }

  browserHostsDraft.value = hosts.join(', ');
  void persistPreferences({
    browserAllowedHosts: hosts,
  });
  notify('Browser actualizado', `Hosts permitidos: ${hosts.join(', ')}.`, {
    kind: 'success',
    sourceId: 'settings',
    sourceLabel: 'Settings',
  });
}

function saveProfileSettings() {
  const normalizedName = profileDraft.value.name.trim() || props.userName;
  const normalizedEmail = profileDraft.value.email.trim() || props.userEmail;

  void props
    .updateProfile(normalizedName, normalizedEmail)
    .then((user) => {
      profileDraft.value = {
        name: user.name,
        email: user.email,
      };

      const welcomeWindow = windows.value.find((item) => item.id === 'welcome');
      if (welcomeWindow) {
        welcomeWindow.title = `Bienvenido ${user.name}`;
        welcomeWindow.description = `Sesion de ${user.email} lista. Puedes abrir apps desde el launcher, mover ventanas y usar clic derecho sobre el fondo.`;
      }

      notify('Perfil actualizado', `Se guardaron los datos de ${user.name}.`, {
        kind: 'success',
        sourceId: 'account',
        sourceLabel: 'Account',
      });
    })
    .catch((error) => {
      notify(
        'No fue posible actualizar el perfil',
        error instanceof Error ? error.message : 'El backend rechazo la actualizacion del usuario.',
        {
          kind: 'error',
          sourceId: 'account',
          sourceLabel: 'Account',
        },
      );
    });
}

function saveWindowDefaults() {
  const normalizedWidth = Math.max(MIN_WINDOW_WIDTH, Number(windowDefaultsDraft.value.width || WINDOW_WIDTH));
  const normalizedHeight = Math.max(MIN_WINDOW_HEIGHT, Number(windowDefaultsDraft.value.height || WINDOW_HEIGHT));

  windowDefaultsDraft.value = {
    width: normalizedWidth,
    height: normalizedHeight,
  };

  void persistPreferences({
    defaultWindowSize: {
      width: normalizedWidth,
      height: normalizedHeight,
    },
  });

  notify('Ventanas actualizadas', `Tamano por defecto: ${normalizedWidth}px x ${normalizedHeight}px.`, {
    kind: 'success',
    sourceId: 'settings',
    sourceLabel: 'Settings',
  });
}

async function resetAppData() {
  const confirmation = window.confirm(
    'Se limpiaran los datos locales, configuracion persistida y cache de la PWA. La aplicacion se recargara. Deseas continuar?',
  );

  if (!confirmation) {
    return;
  }

  isResettingAppData.value = true;

  try {
    if (typeof window !== 'undefined') {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('etherdesk.') || key.startsWith('vite')) {
          window.localStorage.removeItem(key);
        }
      });
      window.sessionStorage.clear();
    }

    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('indexedDB' in window) {
      const indexedDbWithDatabases = window.indexedDB as IDBFactory & {
        databases?: () => Promise<Array<{ name?: string }>>;
      };

      if (indexedDbWithDatabases.databases) {
        const databases = await indexedDbWithDatabases.databases();
        await Promise.all(
          databases
            .filter((database) => Boolean(database.name))
            .map(
              (database) =>
                new Promise<void>((resolve) => {
                  const request = window.indexedDB.deleteDatabase(database.name as string);
                  request.onsuccess = () => resolve();
                  request.onerror = () => resolve();
                  request.onblocked = () => resolve();
                }),
            ),
        );
      }
    }

    emit('logout');
    window.setTimeout(() => {
      window.location.reload();
    }, 120);
  } catch (error) {
    isResettingAppData.value = false;
    notify(
      'No fue posible reiniciar la PWA',
      error instanceof Error ? error.message : 'Ocurrio un error inesperado durante la limpieza local.',
      {
        kind: 'error',
        sourceId: 'settings',
        sourceLabel: 'Settings',
      },
    );
  }
}

function createWorkspaceFile(type: 'notes' | 'terminal') {
  const suggestedName = type === 'notes' ? 'new-note.md' : 'terminal-session.log';
  const nextName = window.prompt(`Nombre del nuevo archivo ${type}`, suggestedName)?.trim();
  if (!nextName) {
    return;
  }

  void props
    .createWorkspaceFile(type, nextName)
    .then(() => {
      refreshLocalWorkspace();
      notify('Archivo creado', `Se preparo un recurso ${type} en el workspace.`, {
        kind: 'success',
        sourceId: 'files',
        sourceLabel: 'Files',
      });
    })
    .catch((error) => {
      notify(
        'No fue posible crear el archivo',
        error instanceof Error ? error.message : 'El backend rechazo la creacion del recurso.',
        {
          kind: 'error',
          sourceId: 'files',
          sourceLabel: 'Files',
        },
      );
    });
}

function notifyNotificationCenter() {
  openNotificationCenter();
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
      notify('Launcher', 'Launcher abierto con atajo de teclado.', {
        kind: 'info',
        sourceId: 'launcher',
        sourceLabel: 'Launcher',
      });
    }
  }

  if (event.key === 'Escape' && isLauncherOpen.value) {
    closeLauncher();
  }
}

async function handleHashChange() {
  const appMatch = window.location.hash.match(/^#\/apps\/([^/?#]+)(?:\?(.*))?$/i);
  if (appMatch) {
    const appId = decodeURIComponent(appMatch[1]);
    const app = props.apps.find((item) => item.id === appId);
    if (app) {
      if (app.id === 'browser' && appMatch[2]) {
        const params = new URLSearchParams(appMatch[2]);
        const targetUrl = params.get('url');
        if (targetUrl) {
          openBrowserUrl(targetUrl);
          return;
        }
      }

      openAppWindow(app.id);
    }
    return;
  }

  const match = window.location.hash.match(/^#\/(notes|ide|terminal)\/([^/?#]+)/i);
  if (!match) {
    return;
  }

  const targetAppId = match[1].toLowerCase() as 'notes' | 'ide' | 'terminal';
  const fileId = decodeURIComponent(match[2]);
  const file = backendFiles.value.find((item) => item.id === fileId);

  if (!file) {
    notify('Deep link no encontrado', 'El archivo solicitado no existe en el workspace actual.', {
      kind: 'warning',
      sourceId: 'launcher',
      sourceLabel: 'Launcher',
    });
    return;
  }

  try {
    await props.activateWorkspaceFile(fileId);
    refreshLocalWorkspace();
    openAppWindow(targetAppId);
  } catch (error) {
    notify(
      'No fue posible resolver el deep link',
      error instanceof Error ? error.message : 'El kernel no pudo activar el archivo solicitado.',
      {
        kind: 'error',
        sourceId: 'launcher',
        sourceLabel: 'Launcher',
      },
    );
  }
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function handleResizeMove(event: MouseEvent) {
  if (!resizeState || !desktopRef.value) {
    return;
  }

  const bounds = desktopRef.value.getBoundingClientRect();
  const windowItem = windows.value.find((item) => item.id === resizeState?.id);

  if (!windowItem || windowItem.isMaximized) {
    return;
  }

  const deltaX = event.clientX - resizeState.startX;
  const deltaY = event.clientY - resizeState.startY;
  const maxWidth = bounds.width - windowItem.x - 12;
  const maxHeight = bounds.height - windowItem.y - 96;

  if (resizeState.direction === 'right' || resizeState.direction === 'corner') {
    windowItem.width = Math.max(MIN_WINDOW_WIDTH, Math.min(resizeState.startWidth + deltaX, maxWidth));
  }

  if (resizeState.direction === 'bottom' || resizeState.direction === 'corner') {
    windowItem.height = Math.max(MIN_WINDOW_HEIGHT, Math.min(resizeState.startHeight + deltaY, maxHeight));
  }
}

function stopResize() {
  resizeState = null;
}

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', stopDrag);
window.addEventListener('mousemove', handleResizeMove);
window.addEventListener('mouseup', stopResize);
window.addEventListener('keydown', handleKeydown);
window.addEventListener('hashchange', hashChangeHandler);

onBeforeUnmount(() => {
  if (clockTimer !== null) {
    window.clearInterval(clockTimer);
  }
  removeOnlineListener?.();
  removeOfflineListener?.();
  removeOfflineStateListener?.();
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('mousemove', handleResizeMove);
  window.removeEventListener('mouseup', stopResize);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('hashchange', hashChangeHandler);
});

onMounted(() => {
  syncLauncherClock();
  refreshLocalWorkspace();
  updateConnectionStatus();
  void updateServiceWorkerStatus();
  updateDisplayMode();
  clockTimer = window.setInterval(syncLauncherClock, 30000);
  const onlineHandler = () => {
    updateConnectionStatus();
    void updateServiceWorkerStatus();
    refreshLocalWorkspace();
  };
  const offlineHandler = () => {
    updateConnectionStatus();
  };
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  removeOnlineListener = () => window.removeEventListener('online', onlineHandler);
  removeOfflineListener = () => window.removeEventListener('offline', offlineHandler);
  removeOfflineStateListener = addOfflineStateListener(() => {
    offlineStateTick.value += 1;
    refreshLocalWorkspace();
  });
  void handleHashChange();
});
</script>
