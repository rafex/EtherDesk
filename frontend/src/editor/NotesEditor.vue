<template>
  <div class="notes-editor">
    <div ref="hostRef" class="notes-editor__surface"></div>
    <footer class="notes-editor__status">
      <span>{{ statusLabel }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { ensureMonacoEnvironment } from '@/editor/monacoEnvironment';
import { addOfflineSyncCompleteListener, queueOfflineAction, readNotesDraft, requestOfflineSync, saveNotesDraft } from '@/os/offline';

const props = defineProps<{
  themeMode: 'ocean' | 'sand';
}>();

const INITIAL_DOCUMENT = `# EtherDesk Notes

Monaco Editor integrado realmente.

- texto plano y markdown
- layout automatico
- listo para persistencia futura

`;

const hostRef = ref<HTMLDivElement | null>(null);
const statusLabel = ref('Cargando editor...');

let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let model: monaco.editor.ITextModel | null = null;
let persistTimer: number | null = null;
let removeSyncCompleteListener: (() => void) | null = null;

function syncStatusFromDraft() {
  const draft = readNotesDraft();
  if (!draft) {
    statusLabel.value = navigator.onLine ? 'Editor listo' : 'Offline: editor local activo';
    return;
  }

  statusLabel.value = draft.syncedAt
    ? `Sincronizado ${new Date(draft.syncedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
    : navigator.onLine
      ? 'Pendiente de sincronizar'
      : 'Offline: guardado local activo';
}

function applyTheme(themeMode: 'ocean' | 'sand') {
  monaco.editor.setTheme(themeMode === 'sand' ? 'etherdesk-sand' : 'etherdesk-ocean');
}

onMounted(() => {
  if (!hostRef.value) {
    return;
  }

  ensureMonacoEnvironment();
  applyTheme(props.themeMode);

  const storedDraft = readNotesDraft();
  model = monaco.editor.createModel(storedDraft?.content || INITIAL_DOCUMENT, 'plaintext');
  editor = monaco.editor.create(hostRef.value, {
    model,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    fontSize: 14,
    wordWrap: 'on',
    padding: {
      top: 16,
      bottom: 16,
    },
    scrollBeyondLastLine: false,
    smoothScrolling: true,
  });

  syncStatusFromDraft();

  model.onDidChangeContent(() => {
    if (persistTimer !== null) {
      window.clearTimeout(persistTimer);
    }

    persistTimer = window.setTimeout(() => {
      const snapshot = saveNotesDraft(model?.getValue() || '');
      queueOfflineAction({
        type: 'notes.sync',
        payload: snapshot,
      });
      statusLabel.value = navigator.onLine ? 'Cambios guardados localmente. Sincronizando...' : 'Offline: cambios guardados localmente';

      if (navigator.onLine) {
        requestOfflineSync();
      }
    }, 250);
  });

  removeSyncCompleteListener = addOfflineSyncCompleteListener(() => {
    syncStatusFromDraft();
  });
});

watch(
  () => props.themeMode,
  (value) => {
    applyTheme(value);
  },
);

onBeforeUnmount(() => {
  if (persistTimer !== null) {
    window.clearTimeout(persistTimer);
  }
  removeSyncCompleteListener?.();
  editor?.dispose();
  model?.dispose();
});
</script>

<style scoped>
.notes-editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}

.notes-editor__surface {
  min-height: 0;
}

.notes-editor__status {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(233, 239, 255, 0.66);
  font-size: 0.76rem;
  background: rgba(8, 13, 22, 0.48);
}
</style>
