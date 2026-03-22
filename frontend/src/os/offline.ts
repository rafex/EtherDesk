import type { FeedbackSubmission, NotesDraftSnapshot, TerminalSessionSnapshot } from '@/shared/types';

const NOTES_DRAFT_KEY = 'etherdesk.notes.draft';
const TERMINAL_SNAPSHOT_KEY = 'etherdesk.terminal.snapshot';
const OFFLINE_QUEUE_KEY = 'etherdesk.offline.queue';
const SYNC_EVENT_NAME = 'etherdesk:sync-request';
const SYNC_COMPLETE_EVENT_NAME = 'etherdesk:sync-complete';
const OFFLINE_STATE_EVENT_NAME = 'etherdesk:offline-state';

export type OfflineAction =
  | {
      id: string;
      type: 'notes.sync';
      createdAt: string;
      payload: NotesDraftSnapshot;
    }
  | {
      id: string;
      type: 'terminal.sync';
      createdAt: string;
      payload: TerminalSessionSnapshot;
    }
  | {
      id: string;
      type: 'feedback.sync';
      createdAt: string;
      payload: FeedbackSubmission;
    };

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function announceOfflineStateChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(OFFLINE_STATE_EVENT_NAME));
}

function removeItem(key: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
}

export function readNotesDraft() {
  return readJson<NotesDraftSnapshot | null>(NOTES_DRAFT_KEY, null);
}

export function saveNotesDraft(content: string, syncedAt: string | null = null) {
  const snapshot: NotesDraftSnapshot = {
    content,
    updatedAt: new Date().toISOString(),
    syncedAt,
  };

  writeJson(NOTES_DRAFT_KEY, snapshot);
  announceOfflineStateChange();
  return snapshot;
}

export function markNotesDraftSynced() {
  const currentDraft = readNotesDraft();
  if (!currentDraft) {
    return;
  }

  writeJson(NOTES_DRAFT_KEY, {
    ...currentDraft,
    syncedAt: new Date().toISOString(),
  });
  announceOfflineStateChange();
}

export function readTerminalSnapshot() {
  return readJson<TerminalSessionSnapshot | null>(TERMINAL_SNAPSHOT_KEY, null);
}

export function saveTerminalSnapshot(snapshot: Pick<TerminalSessionSnapshot, 'history' | 'log'>, syncedAt: string | null = null) {
  const payload: TerminalSessionSnapshot = {
    history: snapshot.history,
    log: snapshot.log,
    updatedAt: new Date().toISOString(),
    syncedAt,
  };

  writeJson(TERMINAL_SNAPSHOT_KEY, payload);
  announceOfflineStateChange();
  return payload;
}

export function markTerminalSnapshotSynced() {
  const currentSnapshot = readTerminalSnapshot();
  if (!currentSnapshot) {
    return;
  }

  writeJson(TERMINAL_SNAPSHOT_KEY, {
    ...currentSnapshot,
    syncedAt: new Date().toISOString(),
  });
  announceOfflineStateChange();
}

export function readOfflineQueue() {
  return readJson<OfflineAction[]>(OFFLINE_QUEUE_KEY, []);
}

function writeOfflineQueue(queue: OfflineAction[]) {
  if (queue.length === 0) {
    removeItem(OFFLINE_QUEUE_KEY);
    return;
  }

  writeJson(OFFLINE_QUEUE_KEY, queue);
}

export function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'createdAt'>) {
  const currentQueue = readOfflineQueue().filter((item) => item.type !== action.type);
  const nextItem: OfflineAction = {
    ...action,
    id: `${action.type}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  writeOfflineQueue([...currentQueue, nextItem]);
  announceOfflineStateChange();
  return nextItem;
}

export function clearOfflineQueue() {
  removeItem(OFFLINE_QUEUE_KEY);
  announceOfflineStateChange();
}

export function requestOfflineSync() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
}

export function addOfflineSyncListener(handler: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(SYNC_EVENT_NAME, handler);
  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, handler);
  };
}

export function announceOfflineSyncComplete() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SYNC_COMPLETE_EVENT_NAME));
}

export function addOfflineSyncCompleteListener(handler: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(SYNC_COMPLETE_EVENT_NAME, handler);
  return () => {
    window.removeEventListener(SYNC_COMPLETE_EVENT_NAME, handler);
  };
}

export function addOfflineStateListener(handler: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(OFFLINE_STATE_EVENT_NAME, handler);
  return () => {
    window.removeEventListener(OFFLINE_STATE_EVENT_NAME, handler);
  };
}

export async function flushOfflineQueue(handlers: {
  syncNotes: (payload: NotesDraftSnapshot) => Promise<void>;
  syncTerminal: (payload: TerminalSessionSnapshot) => Promise<void>;
  syncFeedback: (payload: FeedbackSubmission) => Promise<void>;
}) {
  const queue = readOfflineQueue();
  const remaining: OfflineAction[] = [];
  let processed = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const action = queue[index];

    try {
      if (action.type === 'notes.sync') {
        await handlers.syncNotes(action.payload);
        markNotesDraftSynced();
      } else if (action.type === 'terminal.sync') {
        await handlers.syncTerminal(action.payload);
        markTerminalSnapshotSynced();
      } else if (action.type === 'feedback.sync') {
        await handlers.syncFeedback(action.payload);
      }

      processed += 1;
    } catch {
      remaining.push(...queue.slice(index));
      break;
    }
  }

  writeOfflineQueue(remaining);
  return {
    processed,
    pending: readOfflineQueue().length,
  };
}
