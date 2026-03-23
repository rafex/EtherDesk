import { sessionTtlSeconds } from './auth.js';
import { auditKernelEvent, listKernelEvents } from './audit.js';
import { type KiwiObjectRecord } from './kiwi.js';
import { executeToolkitCommand, listToolkitUsages } from './toolkits/dispatch.js';
import type { MockApp } from './apps.js';
import type {
  AppPermission,
  DesktopPreferencesContract,
  FeedbackSubmissionContract,
  WorkspaceStateContract,
} from '../shared/contracts.js';

interface UserKernelState {
  preferences: DesktopPreferencesContract;
  workspace: WorkspaceStateContract;
  kiwiObjects: KiwiObjectRecord[];
}

interface PreferencesPatch {
  theme?: 'ocean' | 'sand';
  wallpaper?: 'ocean' | 'sunset' | 'graphite';
  browserAllowedHosts?: string[];
  defaultWindowSize?: {
    width: number;
    height: number;
  };
}

function duplicateFileName(name: string) {
  const normalized = name.trim() || 'untitled';
  if (/\.[a-z0-9]+$/i.test(normalized)) {
    return normalized.replace(/(\.[a-z0-9]+)$/i, '-copy$1');
  }

  return `${normalized}-copy`;
}

function findWorkspaceFile(state: UserKernelState, fileId: string) {
  return state.workspace.files.find((file) => file.id === fileId) ?? null;
}

function defaultBrowserAllowedHosts() {
  return ['rafex.dev', 'duckduckgo.com', 'housedb.rafex.app'];
}

function syncActiveWorkspaceSnapshots(workspace: WorkspaceStateContract) {
  const activeNotes = workspace.notesFiles.find((file) => file.id === workspace.activeNotesFileId) ?? null;
  const activeTerminal = workspace.terminalFiles.find((file) => file.id === workspace.activeTerminalFileId) ?? null;

  workspace.notes = activeNotes
    ? {
        id: activeNotes.id,
        name: activeNotes.name,
        content: activeNotes.content,
        updatedAt: activeNotes.updatedAt,
      }
    : null;

  workspace.terminal = activeTerminal
    ? {
        id: activeTerminal.id,
        name: activeTerminal.name,
        history: activeTerminal.history,
        log: activeTerminal.log,
        updatedAt: activeTerminal.updatedAt,
      }
    : null;
}

const userState = new Map<string, UserKernelState>();
function buildDefaultState(): UserKernelState {
  return {
    preferences: {
      theme: 'ocean',
      wallpaper: 'ocean',
      browserAllowedHosts: defaultBrowserAllowedHosts(),
      defaultWindowSize: {
        width: 440,
        height: 320,
      },
      satisfaction: 0,
      lastFeedback: null,
    },
    workspace: {
      activeNotesFileId: null,
      activeTerminalFileId: null,
      notes: null,
      terminal: null,
      notesFiles: [],
      terminalFiles: [],
      files: [],
    },
    kiwiObjects: [],
  };
}

function ensureUserState(userId: string) {
  if (!userState.has(userId)) {
    userState.set(userId, buildDefaultState());
  }

  return userState.get(userId) as UserKernelState;
}

function rebuildFiles(workspace: WorkspaceStateContract) {
  const files: WorkspaceStateContract['files'] = [];

  workspace.notesFiles.forEach((file) => {
    files.push({
      id: file.id,
      name: file.name,
      type: 'notes',
      updatedAt: file.updatedAt,
    });
  });

  workspace.terminalFiles.forEach((file) => {
    files.push({
      id: file.id,
      name: file.name,
      type: 'terminal',
      updatedAt: file.updatedAt,
    });
  });

  workspace.files = files;
  syncActiveWorkspaceSnapshots(workspace);
}

export function buildDesktopPayload(apps: MockApp[], userId: string) {
  const state = ensureUserState(userId);
  const permissions = Array.from(new Set(apps.flatMap((app) => app.permissions))) as AppPermission[];
  const resolvedApps = apps.map((app) =>
    app.id === 'browser'
      ? {
          ...app,
          allowedHosts: state.preferences.browserAllowedHosts,
        }
      : app,
  );

  return {
    apps: resolvedApps,
    kernel: {
      name: 'etherdesk-kernel',
      version: '0.1.0',
      operations: [
        'auth.login',
        'auth.logout',
        'auth.refresh',
        'desktop.bootstrap',
        'desktop.preferences.update',
        'desktop.feedback',
        'workspace.notes.sync',
        'workspace.terminal.sync',
        'terminal.execute.controlled',
        'monitor.read',
      ],
      permissions,
      sessionTtlSeconds: sessionTtlSeconds(),
    },
    preferences: state.preferences,
    workspace: state.workspace,
  };
}

export function saveFeedback(userId: string, feedback: FeedbackSubmissionContract) {
  const state = ensureUserState(userId);
  state.preferences.satisfaction = feedback.rating;
  state.preferences.lastFeedback = feedback;
  auditKernelEvent(userId, 'desktop.feedback', `Feedback ${feedback.rating}/5 registrado.`);
}

export function updatePreferences(userId: string, patch: PreferencesPatch) {
  const state = ensureUserState(userId);

  if (patch.theme) {
    state.preferences.theme = patch.theme;
  }

  if (patch.wallpaper) {
    state.preferences.wallpaper = patch.wallpaper;
  }

  if (patch.browserAllowedHosts) {
    state.preferences.browserAllowedHosts = patch.browserAllowedHosts;
  }

  if (patch.defaultWindowSize) {
    state.preferences.defaultWindowSize = {
      width: Math.max(320, patch.defaultWindowSize.width),
      height: Math.max(220, patch.defaultWindowSize.height),
    };
  }

  auditKernelEvent(userId, 'desktop.preferences.update', 'Preferencias del usuario actualizadas.');
  return state.preferences;
}

export function saveNotesDraft(userId: string, fileId: string, name: string, content: string, updatedAt: string) {
  const state = ensureUserState(userId);
  let targetFile = state.workspace.notesFiles.find((file) => file.id === fileId);

  if (!targetFile) {
    targetFile = {
      id: fileId,
      name: name.trim() || 'notes.md',
      content: '',
      updatedAt,
    };
    state.workspace.notesFiles.push(targetFile);
  }

  targetFile.name = name.trim() || targetFile.name;
  targetFile.content = content;
  targetFile.updatedAt = updatedAt;
  state.workspace.activeNotesFileId = targetFile.id;
  rebuildFiles(state.workspace);
  auditKernelEvent(userId, 'workspace.notes.sync', 'Draft de notes sincronizado.');
}

export function saveTerminalSnapshot(
  userId: string,
  fileId: string,
  name: string,
  history: string[],
  log: string[],
  updatedAt: string,
) {
  const state = ensureUserState(userId);
  let targetFile = state.workspace.terminalFiles.find((file) => file.id === fileId);

  if (!targetFile) {
    targetFile = {
      id: fileId,
      name: name.trim() || 'terminal-session.log',
      history: [],
      log: [],
      updatedAt,
    };
    state.workspace.terminalFiles.push(targetFile);
  }

  targetFile.name = name.trim() || targetFile.name;
  targetFile.history = history;
  targetFile.log = log;
  targetFile.updatedAt = updatedAt;
  state.workspace.activeTerminalFileId = targetFile.id;
  rebuildFiles(state.workspace);
  auditKernelEvent(userId, 'workspace.terminal.sync', 'Snapshot de terminal sincronizado.');
}

export function renameWorkspaceFile(userId: string, fileId: string, name: string) {
  const state = ensureUserState(userId);
  const file = findWorkspaceFile(state, fileId);
  if (!file) {
    return null;
  }

  const nextName = name.trim();
  if (!nextName) {
    return null;
  }

  file.name = nextName;
  auditKernelEvent(userId, 'workspace.file.rename', `Archivo ${fileId} renombrado a ${nextName}.`);
  return file;
}

export function deleteWorkspaceFile(userId: string, fileId: string) {
  const state = ensureUserState(userId);
  const file = findWorkspaceFile(state, fileId);
  if (!file) {
    return false;
  }

  if (file.type === 'notes') {
    state.workspace.notesFiles = state.workspace.notesFiles.filter((item) => item.id !== fileId);
    if (state.workspace.activeNotesFileId === fileId) {
      state.workspace.activeNotesFileId = state.workspace.notesFiles[0]?.id ?? null;
    }
  }

  if (file.type === 'terminal') {
    state.workspace.terminalFiles = state.workspace.terminalFiles.filter((item) => item.id !== fileId);
    if (state.workspace.activeTerminalFileId === fileId) {
      state.workspace.activeTerminalFileId = state.workspace.terminalFiles[0]?.id ?? null;
    }
  }

  rebuildFiles(state.workspace);
  auditKernelEvent(userId, 'workspace.file.delete', `Archivo ${fileId} eliminado del workspace.`);
  return true;
}

export function createWorkspaceFile(userId: string, type: 'notes' | 'terminal', customName = '') {
  const state = ensureUserState(userId);
  const updatedAt = new Date().toISOString();

  if (type === 'notes') {
    const id = `notes-file-${Date.now()}`;
    const nextIndex = state.workspace.notesFiles.length + 1;
    const normalizedName = customName.trim() || (nextIndex === 1 ? 'notes.md' : `notes-${nextIndex}.md`);
    const file = {
      id,
      name: normalizedName,
      content: '',
      updatedAt,
    };
    state.workspace.notesFiles.push(file);
    if (!state.workspace.activeNotesFileId) {
      state.workspace.activeNotesFileId = id;
    }
  }

  if (type === 'terminal') {
    const id = `terminal-file-${Date.now()}`;
    const nextIndex = state.workspace.terminalFiles.length + 1;
    const normalizedName = customName.trim() || (nextIndex === 1 ? 'terminal-session.log' : `terminal-session-${nextIndex}.log`);
    const file = {
      id,
      name: normalizedName,
      history: [],
      log: [],
      updatedAt,
    };
    state.workspace.terminalFiles.push(file);
    if (!state.workspace.activeTerminalFileId) {
      state.workspace.activeTerminalFileId = id;
    }
  }

  rebuildFiles(state.workspace);
  const file = state.workspace.files.find((item) => item.type === type && item.updatedAt === updatedAt) ?? null;
  if (file) {
    auditKernelEvent(userId, 'workspace.file.create', `Archivo ${file.id} creado en el workspace.`);
  }
  return file;
}

export function activateWorkspaceFile(userId: string, fileId: string) {
  const state = ensureUserState(userId);
  const file = findWorkspaceFile(state, fileId);
  if (!file) {
    return null;
  }

  if (file.type === 'notes') {
    state.workspace.activeNotesFileId = fileId;
  }

  if (file.type === 'terminal') {
    state.workspace.activeTerminalFileId = fileId;
  }

  rebuildFiles(state.workspace);
  auditKernelEvent(userId, 'workspace.file.activate', `Archivo ${fileId} activado.`);
  return file;
}

export function duplicateWorkspaceFile(userId: string, fileId: string) {
  const state = ensureUserState(userId);
  const file = findWorkspaceFile(state, fileId);
  if (!file) {
    return null;
  }

  const updatedAt = new Date().toISOString();

  if (file.type === 'notes') {
    const original = state.workspace.notesFiles.find((item) => item.id === fileId);
    if (!original) {
      return null;
    }

    const duplicate = {
      ...original,
      id: `notes-file-${Date.now()}`,
      name: duplicateFileName(original.name),
      updatedAt,
    };
    state.workspace.notesFiles.push(duplicate);
    rebuildFiles(state.workspace);
    auditKernelEvent(userId, 'workspace.file.duplicate', `Archivo ${fileId} duplicado como ${duplicate.id}.`);
    return state.workspace.files.find((item) => item.id === duplicate.id) ?? null;
  }

  const original = state.workspace.terminalFiles.find((item) => item.id === fileId);
  if (!original) {
    return null;
  }

  const duplicate = {
    ...original,
    id: `terminal-file-${Date.now()}`,
    name: duplicateFileName(original.name),
    updatedAt,
  };
  state.workspace.terminalFiles.push(duplicate);
  rebuildFiles(state.workspace);
  auditKernelEvent(userId, 'workspace.file.duplicate', `Archivo ${fileId} duplicado como ${duplicate.id}.`);
  return state.workspace.files.find((item) => item.id === duplicate.id) ?? null;
}

export function executeTerminalCommand(userId: string, command: string, userName: string, userRole: string, apps: MockApp[]) {
  const normalizedCommand = command.trim().toLowerCase();
  let output: string[] = [];
  const state = ensureUserState(userId);
  const toolkitResult = executeToolkitCommand({
    userId,
    userName,
    userRole,
    rawCommand: command,
    apps,
    kiwiObjects: state.kiwiObjects,
  });
  if (toolkitResult) {
    return toolkitResult;
  }

  switch (normalizedCommand) {
    case 'help':
      output = [
        'Comandos permitidos:',
        'help',
        'date',
        'whoami',
        'apps',
        'theme',
        'kernel',
        ...listToolkitUsages(userRole),
      ];
      break;
    case 'date':
      output = [new Date().toLocaleString('es-MX')];
      break;
    case 'whoami':
      output = [userName];
      break;
    case 'apps':
      output = [apps.map((app) => app.name).join(', ')];
      break;
    case 'theme': {
      output = [state.preferences.theme];
      break;
    }
    case 'kernel':
      output = ['etherdesk-kernel 0.1.0'];
      break;
    default:
      auditKernelEvent(userId, 'terminal.execute.denied', `Comando bloqueado: ${command}`, 'warning');
      return {
        ok: false,
        output: [`Comando no permitido: ${command}`],
      };
  }

  auditKernelEvent(userId, 'terminal.execute.controlled', `Comando ejecutado: ${normalizedCommand}`);
  return {
    ok: true,
    output,
  };
}

export function buildMonitorPayload(userId: string, apps: MockApp[]) {
  const state = ensureUserState(userId);
  return {
    kernel: buildDesktopPayload(apps, userId).kernel,
    preferences: state.preferences,
    workspace: state.workspace,
    metrics: {
      registeredApps: apps.length,
      files: state.workspace.files.length,
      events: listKernelEvents(userId).length,
    },
    events: listKernelEvents(userId),
  };
}
