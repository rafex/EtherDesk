export interface AppShortcut {
  id: string;
  name: string;
  description: string;
  icon: string;
  route?: string;
  url?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DesktopKernelState {
  apps: AppShortcut[];
  user: SessionUser;
  kernel: {
    name: string;
    version: string;
    operations: string[];
  };
  preferences: {
    satisfaction: number;
  };
  workspace?: {
    notes?: {
      content: string;
      updatedAt: string;
    } | null;
    terminal?: {
      history: string[];
      log: string[];
      updatedAt: string;
    } | null;
  };
}

export interface NotesDraftSnapshot {
  content: string;
  updatedAt: string;
  syncedAt?: string | null;
}

export interface TerminalSessionSnapshot {
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

export interface ServiceAlert {
  id: number;
  service: string;
  title: string;
  message: string;
  createdAt: string;
}
