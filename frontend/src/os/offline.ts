import type { FeedbackSubmission, NotesDraftSnapshot, TerminalSessionSnapshot } from '@/shared/types';

const NOTES_DRAFTS_KEY = 'etherdesk.notes.drafts';
const TERMINAL_SNAPSHOTS_KEY = 'etherdesk.terminal.snapshots';
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

function readNotesDraftsMap() {
  return readJson<Record<string, NotesDraftSnapshot>>(NOTES_DRAFTS_KEY, {});
}

function writeNotesDraftsMap(value: Record<string, NotesDraftSnapshot>) {
  writeJson(NOTES_DRAFTS_KEY, value);
}

function readTerminalSnapshotsMap() {
  return readJson<Record<string, TerminalSessionSnapshot>>(TERMINAL_SNAPSHOTS_KEY, {});
}

function writeTerminalSnapshotsMap(value: Record<string, TerminalSessionSnapshot>) {
  writeJson(TERMINAL_SNAPSHOTS_KEY, value);
}

export function listNotesDrafts() {
  return Object.values(readNotesDraftsMap());
}

export function readNotesDraft(fileId: string) {
  return readNotesDraftsMap()[fileId] ?? null;
}

export function saveNotesDraft(
  fileId: string,
  name: string,
  content: string,
  syncedAt: string | null = null,
  updatedAt = new Date().toISOString(),
) {
  const snapshot: NotesDraftSnapshot = {
    fileId,
    name,
    content,
    updatedAt,
    syncedAt,
  };

  const drafts = readNotesDraftsMap();
  drafts[fileId] = snapshot;
  writeNotesDraftsMap(drafts);
  announceOfflineStateChange();
  return snapshot;
}

export function removeNotesDraft(fileId: string) {
  const drafts = readNotesDraftsMap();
  delete drafts[fileId];
  writeNotesDraftsMap(drafts);
  announceOfflineStateChange();
}

export function markNotesDraftSynced(fileId: string) {
  const currentDraft = readNotesDraft(fileId);
  if (!currentDraft) {
    return;
  }

  saveNotesDraft(currentDraft.fileId, currentDraft.name, currentDraft.content, new Date().toISOString(), currentDraft.updatedAt);
  announceOfflineStateChange();
}

export function listTerminalSnapshots() {
  return Object.values(readTerminalSnapshotsMap());
}

export function readTerminalSnapshot(fileId: string) {
  return readTerminalSnapshotsMap()[fileId] ?? null;
}

export function saveTerminalSnapshot(
  snapshot: Pick<TerminalSessionSnapshot, 'fileId' | 'name' | 'history' | 'log'>,
  syncedAt: string | null = null,
  updatedAt = new Date().toISOString(),
) {
  const payload: TerminalSessionSnapshot = {
    fileId: snapshot.fileId,
    name: snapshot.name,
    history: snapshot.history,
    log: snapshot.log,
    updatedAt,
    syncedAt,
  };

  const snapshots = readTerminalSnapshotsMap();
  snapshots[snapshot.fileId] = payload;
  writeTerminalSnapshotsMap(snapshots);
  announceOfflineStateChange();
  return payload;
}

export function removeTerminalSnapshot(fileId: string) {
  const snapshots = readTerminalSnapshotsMap();
  delete snapshots[fileId];
  writeTerminalSnapshotsMap(snapshots);
  announceOfflineStateChange();
}

export function clearLegacyOfflineKeys() {
  removeItem('etherdesk.notes.draft');
  removeItem('etherdesk.terminal.snapshot');
}

export function markTerminalSnapshotSynced(fileId: string) {
  const currentSnapshot = readTerminalSnapshot(fileId);
  if (!currentSnapshot) {
    return;
  }

  saveTerminalSnapshot(currentSnapshot, new Date().toISOString(), currentSnapshot.updatedAt);
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

function offlineActionIdentity(action: Omit<OfflineAction, 'id' | 'createdAt'> | OfflineAction) {
  if (action.type === 'notes.sync' || action.type === 'terminal.sync') {
    return `${action.type}:${action.payload.fileId}`;
  }

  return action.type;
}

export function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'createdAt'>) {
  const currentQueue = readOfflineQueue().filter((item) => offlineActionIdentity(item) !== offlineActionIdentity(action));
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
        markNotesDraftSynced(action.payload.fileId);
      } else if (action.type === 'terminal.sync') {
        await handlers.syncTerminal(action.payload);
        markTerminalSnapshotSynced(action.payload.fileId);
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
