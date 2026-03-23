type MonacoNamespace = {
  editor: {
    defineTheme: (name: string, theme: unknown) => void;
    setTheme: (name: string) => void;
    createModel: (value: string, language?: string) => {
      dispose: () => void;
      getValue: () => string;
      onDidChangeContent: (listener: () => void) => { dispose: () => void };
    };
    create: (
      element: HTMLElement,
      options: Record<string, unknown>,
    ) => {
      dispose: () => void;
    };
  };
};

type MonacoWindow = Window & typeof globalThis & {
  require?: {
    config: (options: Record<string, unknown>) => void;
    (modules: string[], onLoad: () => void): void;
  };
  monaco?: MonacoNamespace;
};

export const MONACO_REMOTE_VERSION = '0.55.0-r1';
const MONACO_BASE_URL = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.0/min/vs';
export const MONACO_REMOTE_ASSETS = [
  `${MONACO_BASE_URL}/loader.js`,
  `${MONACO_BASE_URL}/editor/editor.main.nls.js`,
  `${MONACO_BASE_URL}/editor/editor.main.css`,
  `${MONACO_BASE_URL}/editor/editor.main.js`,
  `${MONACO_BASE_URL}/base/worker/workerMain.js`,
];

let themesRegistered = false;
let loaderPromise: Promise<MonacoNamespace> | null = null;

function injectScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-monaco-loader="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.monacoLoader = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No fue posible cargar Monaco desde el CDN.'));
    document.head.appendChild(script);
  });
}

function registerThemes(monaco: MonacoNamespace) {
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

export async function ensureMonacoEnvironment() {
  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = (async () => {
    const monacoWindow = window as MonacoWindow;

    await injectScript(`${MONACO_BASE_URL}/loader.js`);

    const requireLoader = monacoWindow.require;
    if (!requireLoader) {
      throw new Error('Monaco loader no esta disponible.');
    }

    requireLoader.config({
      paths: {
        vs: MONACO_BASE_URL,
      },
    });

    await new Promise<void>((resolve) => {
      requireLoader(['vs/editor/editor.main'], () => resolve());
    });

    const monaco = monacoWindow.monaco;
    if (!monaco) {
      throw new Error('Monaco no pudo inicializarse.');
    }

    registerThemes(monaco);
    return monaco;
  })();

  return loaderPromise;
}

export function precacheMonacoAssets() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.controller?.postMessage({
    type: 'etherdesk:precache-monaco',
    version: MONACO_REMOTE_VERSION,
    assets: MONACO_REMOTE_ASSETS,
  });
}
