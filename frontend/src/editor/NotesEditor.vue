<template>
  <div ref="hostRef" class="notes-editor"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { ensureMonacoEnvironment } from '@/editor/monacoEnvironment';

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

let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let model: monaco.editor.ITextModel | null = null;

function applyTheme(themeMode: 'ocean' | 'sand') {
  monaco.editor.setTheme(themeMode === 'sand' ? 'etherdesk-sand' : 'etherdesk-ocean');
}

onMounted(() => {
  if (!hostRef.value) {
    return;
  }

  ensureMonacoEnvironment();
  applyTheme(props.themeMode);

  model = monaco.editor.createModel(INITIAL_DOCUMENT, 'plaintext');
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
});

watch(
  () => props.themeMode,
  (value) => {
    applyTheme(value);
  },
);

onBeforeUnmount(() => {
  editor?.dispose();
  model?.dispose();
});
</script>

<style scoped>
.notes-editor {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
