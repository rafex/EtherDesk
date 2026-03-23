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

export interface AppShortcutContract {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  url?: string;
  allowedHosts?: string[];
  type: 'core' | 'workspace' | 'system' | 'integration';
  origin: 'internal' | 'external';
  permissions: AppPermission[];
}

export interface FeedbackSubmissionContract {
  rating: number;
  chips: string[];
  comment: string;
}

export interface DesktopPreferencesContract {
  theme: 'ocean' | 'sand';
  wallpaper: 'ocean' | 'sunset' | 'graphite';
  browserAllowedHosts: string[];
  defaultWindowSize: {
    width: number;
    height: number;
  };
  satisfaction: number;
  lastFeedback: FeedbackSubmissionContract | null;
}

export interface WorkspaceStateContract {
  activeNotesFileId: string | null;
  activeTerminalFileId: string | null;
  notes: {
    id: string;
    name: string;
    content: string;
    updatedAt: string;
  } | null;
  terminal: {
    id: string;
    name: string;
    history: string[];
    log: string[];
    updatedAt: string;
  } | null;
  notesFiles: Array<{
    id: string;
    name: string;
    content: string;
    updatedAt: string;
  }>;
  terminalFiles: Array<{
    id: string;
    name: string;
    history: string[];
    log: string[];
    updatedAt: string;
  }>;
  files: Array<{
    id: string;
    name: string;
    type: 'notes' | 'terminal';
    updatedAt: string;
  }>;
}
