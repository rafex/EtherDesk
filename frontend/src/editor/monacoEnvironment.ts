import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

type MonacoWindow = Window & typeof globalThis & {
  MonacoEnvironment?: {
    getWorker: (_moduleId: string, label: string) => Worker;
  };
};

let themesRegistered = false;

export function ensureMonacoEnvironment() {
  const monacoWindow = window as MonacoWindow;

  if (!monacoWindow.MonacoEnvironment) {
    monacoWindow.MonacoEnvironment = {
      getWorker() {
        return new editorWorker();
      },
    };
  }

  if (themesRegistered) {
    return;
  }

  monaco.editor.defineTheme('etherdesk-ocean', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#111315',
      'editor.foreground': '#d6d9e0',
      'editorLineNumber.foreground': '#596274',
      'editorLineNumber.activeForeground': '#8fb8ff',
      'editorCursor.foreground': '#8fb8ff',
      'editor.selectionBackground': '#264260',
      'editor.inactiveSelectionBackground': '#1b3148',
    },
  });

  monaco.editor.defineTheme('etherdesk-sand', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#17120d',
      'editor.foreground': '#f5e6c9',
      'editorLineNumber.foreground': '#8f7550',
      'editorLineNumber.activeForeground': '#ffcf7a',
      'editorCursor.foreground': '#ffcf7a',
      'editor.selectionBackground': '#5b4520',
      'editor.inactiveSelectionBackground': '#3f3117',
    },
  });

  themesRegistered = true;
}
