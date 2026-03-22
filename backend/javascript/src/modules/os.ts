import type { MockApp } from './apps.js';

const satisfactionByUser = new Map<string, number>();
const notesByUser = new Map<string, { content: string; updatedAt: string }>();
const terminalByUser = new Map<string, { history: string[]; log: string[]; updatedAt: string }>();

export function buildDesktopPayload(apps: MockApp[], userId: string) {
  return {
    apps,
    kernel: {
      name: 'etherdesk-kernel',
      version: '0.1.0',
      operations: [
        'auth.login',
        'auth.logout',
        'desktop.bootstrap',
        'desktop.feedback',
        'workspace.notes.sync',
        'workspace.terminal.sync',
      ],
    },
    preferences: {
      satisfaction: satisfactionByUser.get(userId) ?? 0,
    },
    workspace: {
      notes: notesByUser.get(userId) ?? null,
      terminal: terminalByUser.get(userId) ?? null,
    },
  };
}

export function saveSatisfaction(userId: string, rating: number) {
  satisfactionByUser.set(userId, rating);
}

export function saveNotesDraft(userId: string, content: string, updatedAt: string) {
  notesByUser.set(userId, {
    content,
    updatedAt,
  });
}

export function saveTerminalSnapshot(userId: string, history: string[], log: string[], updatedAt: string) {
  terminalByUser.set(userId, {
    history,
    log,
    updatedAt,
  });
}
