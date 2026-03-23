<template>
  <div class="terminal-pane">
    <div ref="hostRef" class="terminal-pane__surface"></div>
    <footer class="terminal-pane__status">
      <span>{{ props.sessionName }}</span>
      <span>{{ statusLabel }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { addOfflineSyncCompleteListener, queueOfflineAction, readTerminalSnapshot, requestOfflineSync, saveTerminalSnapshot } from '@/os/offline';

const props = defineProps<{
  userName: string;
  apps: string[];
  sessionId: string;
  sessionName: string;
  themeMode: 'ocean' | 'sand';
  executeCommand: (command: string) => Promise<{ ok: boolean; output: string[] }>;
  afterCommand?: () => void | Promise<void>;
}>();

const hostRef = ref<HTMLDivElement | null>(null);
const statusLabel = ref('Cargando terminal...');

let term: Terminal | null = null;
let fitAddon: FitAddon | null = null;
let resizeObserver: ResizeObserver | null = null;
let commandBuffer = '';
let logLines: string[] = [];
let commandHistory: string[] = [];
let removeSyncCompleteListener: (() => void) | null = null;

function terminalTheme(themeMode: 'ocean' | 'sand') {
  if (themeMode === 'sand') {
    return {
      background: '#17120d',
      foreground: '#f5e6c9',
      cursor: '#ffcf7a',
      black: '#17120d',
      brightBlack: '#7b6a4f',
      blue: '#ffcf7a',
      brightBlue: '#ffd996',
      red: '#f59e0b',
      green: '#fbbf24',
      yellow: '#fde68a',
    };
  }

  return {
    background: '#111315',
    foreground: '#d6d9e0',
    cursor: '#8fb8ff',
    black: '#111315',
    brightBlack: '#596274',
    blue: '#8fb8ff',
    brightBlue: '#b9d4ff',
    red: '#f87171',
    green: '#34d399',
    yellow: '#fbbf24',
  };
}

function promptLabel() {
  return `${props.userName.toLowerCase()}@etherdesk:$ `;
}

function printPrompt() {
  term?.write(`\r\n${promptLabel()}`);
}

function writeLine(line: string) {
  logLines.push(line);
  term?.writeln(line);
}

function persistTerminalSnapshot() {
  const snapshot = saveTerminalSnapshot({
    fileId: props.sessionId,
    name: props.sessionName,
    history: commandHistory,
    log: logLines,
  });

  queueOfflineAction({
    type: 'terminal.sync',
    payload: snapshot,
  });

  statusLabel.value = navigator.onLine ? 'Sesion guardada localmente. Sincronizando...' : 'Offline: sesion guardada localmente';
  if (navigator.onLine) {
    requestOfflineSync();
  }
}

function syncStatusFromSnapshot() {
  const snapshot = readTerminalSnapshot(props.sessionId);
  if (!snapshot) {
    statusLabel.value = navigator.onLine ? 'Terminal lista' : 'Offline: terminal local activa';
    return;
  }

  statusLabel.value = snapshot.syncedAt
    ? `Sincronizado ${new Date(snapshot.syncedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
    : navigator.onLine
      ? 'Sesion restaurada. Pendiente de sincronizar'
      : 'Offline: sesion restaurada localmente';
}

function writeIntro() {
  if (!term) {
    return;
  }

  writeLine('EtherDesk Terminal');
  writeLine('Terminal controlada por kernel. No expone bash ni shell real.');
  writeLine('Comandos permitidos: help, clear, date, whoami, apps, theme, kernel, kiwi --help, kiwi --list-objects, kiwi --new-object --name <nombre>, atlas --help, atlas --status, atlas --list-apps');
  term.write(promptLabel());
}

async function runCommand(rawCommand: string) {
  if (!term) {
    return;
  }

  const command = rawCommand.trim().toLowerCase();
  const promptEntry = `${promptLabel()}${rawCommand}`;

  if (rawCommand !== '') {
    logLines.push(promptEntry);
    commandHistory.push(rawCommand);
  }

  switch (command) {
    case '':
      printPrompt();
      break;
    case 'help':
      writeLine('');
      writeLine('help    lista comandos');
      writeLine('clear   limpia la terminal');
      writeLine('date    fecha local');
      writeLine('whoami  usuario actual');
      writeLine('apps    aplicaciones disponibles');
      writeLine('theme   tema visual actual');
      writeLine('kernel  version del kernel');
      writeLine('kiwi --help');
      writeLine('kiwi --list-objects');
      writeLine('kiwi --new-object --name <nombre>');
      writeLine('atlas --help');
      writeLine('atlas --status');
      writeLine('atlas --list-apps');
      printPrompt();
      break;
    case 'clear':
      term.clear();
      logLines = [];
      term.write(promptLabel());
      persistTerminalSnapshot();
      break;
    default:
      statusLabel.value = navigator.onLine ? 'Ejecutando en kernel...' : 'Offline: la terminal requiere conexion para ejecutar comandos';
      writeLine('');

      try {
        const result = await props.executeCommand(rawCommand);
        result.output.forEach((line) => writeLine(line));
        printPrompt();
        persistTerminalSnapshot();
        await props.afterCommand?.();
      } catch (error) {
        writeLine(error instanceof Error ? error.message : `No fue posible ejecutar: ${rawCommand}`);
        printPrompt();
        statusLabel.value = 'Kernel no disponible';
      }
      break;
  }
}

function bindInput() {
  if (!term) {
    return;
  }

  term.onData((data) => {
    if (!term) {
      return;
    }

    if (data === '\r') {
      void runCommand(commandBuffer);
      commandBuffer = '';
      return;
    }

    if (data === '\u007f') {
      if (commandBuffer.length > 0) {
        commandBuffer = commandBuffer.slice(0, -1);
        term.write('\b \b');
      }
      return;
    }

    if (/^[\x20-\x7E]$/.test(data)) {
      commandBuffer += data;
      term.write(data);
    }
  });
}

onMounted(() => {
  if (!hostRef.value) {
    return;
  }

  fitAddon = new FitAddon();
  term = new Terminal({
    cursorBlink: true,
    fontSize: 13,
    fontFamily: '"SFMono-Regular", "Menlo", monospace',
    theme: terminalTheme(props.themeMode),
    convertEol: true,
  });

  term.loadAddon(fitAddon);
  term.open(hostRef.value);
  fitAddon.fit();
  bindInput();

  const storedSnapshot = readTerminalSnapshot(props.sessionId);
  if (storedSnapshot && storedSnapshot.log.length > 0) {
    logLines = [...storedSnapshot.log];
    commandHistory = [...storedSnapshot.history];
    storedSnapshot.log.forEach((line) => term?.writeln(line));
    term.write(promptLabel());
    syncStatusFromSnapshot();
  } else {
    writeIntro();
    statusLabel.value = navigator.onLine ? 'Terminal lista' : 'Offline: terminal local activa';
  }

  removeSyncCompleteListener = addOfflineSyncCompleteListener(() => {
    syncStatusFromSnapshot();
  });

  resizeObserver = new ResizeObserver(() => {
    fitAddon?.fit();
  });

  resizeObserver.observe(hostRef.value);
});

watch(
  () => props.themeMode,
  (value) => {
    if (term) {
      term.options.theme = terminalTheme(value);
    }
  },
);

watch(
  () => [props.sessionId, props.sessionName] as const,
  () => {
    const storedSnapshot = readTerminalSnapshot(props.sessionId);
    if (!term) {
      return;
    }

    term.clear();
    logLines = storedSnapshot?.log ? [...storedSnapshot.log] : [];
    commandHistory = storedSnapshot?.history ? [...storedSnapshot.history] : [];

    if (storedSnapshot && storedSnapshot.log.length > 0) {
      storedSnapshot.log.forEach((line) => term?.writeln(line));
      term.write(promptLabel());
      syncStatusFromSnapshot();
    } else {
      writeIntro();
      statusLabel.value = navigator.onLine ? 'Terminal lista' : 'Offline: terminal local activa';
    }
  },
);

onBeforeUnmount(() => {
  removeSyncCompleteListener?.();
  resizeObserver?.disconnect();
  term?.dispose();
});
</script>

<style scoped>
.terminal-pane {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}

.terminal-pane__surface {
  min-height: 0;
  padding: 10px;
}

.terminal-pane__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
  padding: 0 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(233, 239, 255, 0.66);
  font-size: 0.76rem;
  background: rgba(8, 13, 22, 0.48);
}

:deep(.xterm) {
  height: 100%;
}

:deep(.xterm-viewport) {
  overflow-y: auto !important;
}
</style>
