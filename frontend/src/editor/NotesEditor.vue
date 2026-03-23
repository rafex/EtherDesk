<template>
  <div class="notes-lite">
    <div ref="hostRef" class="notes-lite__surface"></div>
    <footer class="notes-lite__status">
      <span>{{ fileName }}</span>
      <span>{{ statusLabel }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { addOfflineSyncCompleteListener, queueOfflineAction, readNotesDraft, requestOfflineSync, saveNotesDraft } from '@/os/offline';

const props = defineProps<{
  themeMode: 'ocean' | 'sand';
  fileId: string;
  fileName: string;
}>();

const INITIAL_DOCUMENT = `# EtherDesk Notes

Editor ligero con CodeMirror.
`;

const hostRef = ref<HTMLDivElement | null>(null);
const statusLabel = ref('Cargando editor...');

let editor: EditorView | null = null;
let persistTimer: number | null = null;
let removeSyncCompleteListener: (() => void) | null = null;

function syncStatusFromDraft() {
  const draft = readNotesDraft(props.fileId);
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

function editorTheme(themeMode: 'ocean' | 'sand') {
  const isSand = themeMode === 'sand';

  return EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: isSand ? '#17120d' : '#111315',
      color: isSand ? '#f5e6c9' : '#d6d9e0',
    },
    '.cm-scroller': {
      fontFamily: '"SFMono-Regular", "Menlo", monospace',
      lineHeight: '1.55',
    },
    '.cm-content': {
      padding: '16px 18px',
      caretColor: isSand ? '#ffcf7a' : '#8fb8ff',
    },
    '.cm-gutters': {
      backgroundColor: isSand ? '#17120d' : '#111315',
      color: isSand ? '#8f7550' : '#596274',
      border: 'none',
    },
    '.cm-activeLine': {
      backgroundColor: isSand ? 'rgba(255, 207, 122, 0.08)' : 'rgba(143, 184, 255, 0.08)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: isSand ? '#5b4520' : '#264260',
    },
  });
}

function persistDocument(content: string) {
  const snapshot = saveNotesDraft(props.fileId, props.fileName, content);
  queueOfflineAction({
    type: 'notes.sync',
    payload: snapshot,
  });
  statusLabel.value = navigator.onLine ? 'Cambios guardados localmente. Sincronizando...' : 'Offline: cambios guardados localmente';

  if (navigator.onLine) {
    requestOfflineSync();
  }
}

function rebuildEditor(themeMode: 'ocean' | 'sand') {
  if (!hostRef.value) {
    return;
  }

  const currentValue = editor?.state.doc.toString() || readNotesDraft(props.fileId)?.content || INITIAL_DOCUMENT;
  editor?.destroy();

  editor = new EditorView({
    state: EditorState.create({
      doc: currentValue,
      extensions: [
        editorTheme(themeMode),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) {
            return;
          }

          if (persistTimer !== null) {
            window.clearTimeout(persistTimer);
          }

          persistTimer = window.setTimeout(() => {
            persistDocument(update.state.doc.toString());
          }, 250);
        }),
      ],
    }),
    parent: hostRef.value,
  });
}

onMounted(() => {
  if (!hostRef.value) {
    return;
  }

  rebuildEditor(props.themeMode);
  syncStatusFromDraft();

  removeSyncCompleteListener = addOfflineSyncCompleteListener(() => {
    syncStatusFromDraft();
  });
});

watch(
  () => props.themeMode,
  (value) => {
    rebuildEditor(value);
  },
);

watch(
  () => [props.fileId, props.fileName] as const,
  () => {
    rebuildEditor(props.themeMode);
    syncStatusFromDraft();
  },
);

onBeforeUnmount(() => {
  if (persistTimer !== null) {
    window.clearTimeout(persistTimer);
  }
  removeSyncCompleteListener?.();
  editor?.destroy();
});
</script>

<style scoped>
.notes-lite {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}

.notes-lite__surface {
  min-height: 0;
  overflow: hidden;
}

.notes-lite__status {
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
