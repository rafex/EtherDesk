<template>
  <div class="notes-editor">
    <div ref="hostRef" class="notes-editor__surface"></div>
    <footer class="notes-editor__status">
      <span>{{ fileName }}</span>
      <span>{{ statusLabel }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ensureMonacoEnvironment, precacheMonacoAssets } from '@/editor/monacoEnvironment';
import { addOfflineSyncCompleteListener, queueOfflineAction, readNotesDraft, requestOfflineSync, saveNotesDraft } from '@/os/offline';

const props = defineProps<{
  themeMode: 'ocean' | 'sand';
  fileId: string;
  fileName: string;
}>();

const INITIAL_DOCUMENT = `# EtherDesk IDE

Monaco reservado para edicion avanzada del documento activo.
`;

const hostRef = ref<HTMLDivElement | null>(null);
const statusLabel = ref('Cargando IDE...');

let editor: { dispose: () => void } | null = null;
let model:
  | {
      dispose: () => void;
      getValue: () => string;
      onDidChangeContent: (listener: () => void) => { dispose: () => void };
    }
  | null = null;
let persistTimer: number | null = null;
let removeSyncCompleteListener: (() => void) | null = null;
let monacoInstance: Awaited<ReturnType<typeof ensureMonacoEnvironment>> | null = null;

function syncStatusFromDraft() {
  const draft = readNotesDraft(props.fileId);
  if (!draft) {
    statusLabel.value = navigator.onLine ? 'IDE lista' : 'Offline: IDE local activa';
    return;
  }

  statusLabel.value = draft.syncedAt
    ? `Sincronizado ${new Date(draft.syncedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
    : navigator.onLine
      ? 'Pendiente de sincronizar'
      : 'Offline: guardado local activo';
}

function applyTheme(themeMode: 'ocean' | 'sand') {
  monacoInstance?.editor.setTheme(themeMode === 'sand' ? 'etherdesk-sand' : 'etherdesk-ocean');
}

async function mountEditor() {
  if (!hostRef.value) {
    return;
  }

  removeSyncCompleteListener?.();
  editor?.dispose();
  model?.dispose();
  monacoInstance = await ensureMonacoEnvironment();
  applyTheme(props.themeMode);

  const storedDraft = readNotesDraft(props.fileId);
  model = monacoInstance.editor.createModel(storedDraft?.content || INITIAL_DOCUMENT, 'plaintext');
  editor = monacoInstance.editor.create(hostRef.value, {
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
      const snapshot = saveNotesDraft(props.fileId, props.fileName, model?.getValue() || '');
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
}

onMounted(async () => {
  precacheMonacoAssets();
  await mountEditor();
});

watch(
  () => props.themeMode,
  (value) => {
    applyTheme(value);
  },
);

watch(
  () => [props.fileId, props.fileName] as const,
  async () => {
    await mountEditor();
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
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
  padding: 0 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(233, 239, 255, 0.66);
  font-size: 0.76rem;
  background: rgba(8, 13, 22, 0.48);
}
</style>
