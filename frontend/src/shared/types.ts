export type AppPermission =
  | 'browser.navigate'
  | 'notes.read'
  | 'notes.write'
  | 'terminal.execute.controlled'
  | 'notifications.read'
  | 'settings.write'
  | 'account.read'
  | 'files.read'
  | 'files.write'
  | 'monitor.read'
  | 'tasks.read'
  | 'help.read';

export interface AppShortcut {
  id: string;
  name: string;
  description: string;
  icon: string;
  route?: string;
  url?: string;
  allowedHosts?: string[];
  type?: 'core' | 'workspace' | 'system' | 'integration';
  origin?: 'internal' | 'external';
  permissions?: AppPermission[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface NotesDraftSnapshot {
  fileId: string;
  name: string;
  content: string;
  updatedAt: string;
  syncedAt?: string | null;
}

export interface TerminalSessionSnapshot {
  fileId: string;
  name: string;
  history: string[];
  log: string[];
  updatedAt: string;
  syncedAt?: string | null;
}

export interface FeedbackSubmission {
  rating: number;
  chips: string[];
  comment: string;
}

export interface DesktopPreferences {
  theme: 'ocean' | 'sand';
  wallpaper: 'ocean' | 'sunset' | 'graphite';
  browserAllowedHosts: string[];
  defaultWindowSize: {
    width: number;
    height: number;
  };
  satisfaction: number;
  lastFeedback?: FeedbackSubmission | null;
}

export interface WorkspaceState {
  activeNotesFileId?: string | null;
  activeTerminalFileId?: string | null;
  notes?: {
    id: string;
    name: string;
    content: string;
    updatedAt: string;
  } | null;
  terminal?: {
    id: string;
    name: string;
    history: string[];
    log: string[];
    updatedAt: string;
  } | null;
  notesFiles?: Array<{
    id: string;
    name: string;
    content: string;
    updatedAt: string;
  }>;
  terminalFiles?: Array<{
    id: string;
    name: string;
    history: string[];
    log: string[];
    updatedAt: string;
  }>;
  files?: Array<{
    id: string;
    name: string;
    type: 'notes' | 'terminal';
    updatedAt: string;
  }>;
}

export interface KernelDescriptor {
  name: string;
  version: string;
  operations: string[];
  permissions: AppPermission[];
  sessionTtlSeconds: number;
}

export interface DesktopKernelState {
  apps: AppShortcut[];
  user: SessionUser;
  kernel: KernelDescriptor;
  preferences: DesktopPreferences;
  workspace?: WorkspaceState;
}

export interface ServiceAlert {
  id: number;
  service: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface SessionEnvelope {
  token: string;
  user: SessionUser;
  expiresAt: string;
}

export interface KernelEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  level: 'info' | 'warning' | 'error';
}

export interface KernelMonitorState {
  kernel: KernelDescriptor;
  preferences: DesktopPreferences;
  workspace: WorkspaceState;
  metrics: {
    registeredApps: number;
    files: number;
    events: number;
  };
  events: KernelEvent[];
}
