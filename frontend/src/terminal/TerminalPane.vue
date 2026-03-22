<template>
  <div ref="hostRef" class="terminal-pane"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const props = defineProps<{
  userName: string;
  apps: string[];
  themeMode: 'ocean' | 'sand';
}>();

const hostRef = ref<HTMLDivElement | null>(null);

let term: Terminal | null = null;
let fitAddon: FitAddon | null = null;
let resizeObserver: ResizeObserver | null = null;
let commandBuffer = '';

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

function writeIntro() {
  if (!term) {
    return;
  }

  term.writeln('EtherDesk Terminal');
  term.writeln('Comandos permitidos: help, clear, date, whoami, apps, theme');
  term.write(promptLabel());
}

function runCommand(rawCommand: string) {
  if (!term) {
    return;
  }

  const command = rawCommand.trim().toLowerCase();

  switch (command) {
    case '':
      printPrompt();
      break;
    case 'help':
      term.writeln('\r\nhelp   lista comandos');
      term.writeln('clear  limpia la terminal');
      term.writeln('date   fecha local');
      term.writeln('whoami usuario actual');
      term.writeln('apps   aplicaciones disponibles');
      term.writeln('theme  tema visual actual');
      printPrompt();
      break;
    case 'clear':
      term.clear();
      term.write(promptLabel());
      break;
    case 'date':
      term.writeln(`\r\n${new Date().toLocaleString('es-MX')}`);
      printPrompt();
      break;
    case 'whoami':
      term.writeln(`\r\n${props.userName}`);
      printPrompt();
      break;
    case 'apps':
      term.writeln(`\r\n${props.apps.join(', ')}`);
      printPrompt();
      break;
    case 'theme':
      term.writeln(`\r\n${props.themeMode}`);
      printPrompt();
      break;
    default:
      term.writeln(`\r\nComando no permitido: ${rawCommand}`);
      printPrompt();
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
      runCommand(commandBuffer);
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
  writeIntro();

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

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  term?.dispose();
});
</script>

<style scoped>
.terminal-pane {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

:deep(.xterm) {
  height: 100%;
}

:deep(.xterm-viewport) {
  overflow-y: auto !important;
}
</style>
