import type { MockApp } from './apps.js';

const satisfactionByUser = new Map<string, number>();

export function buildDesktopPayload(apps: MockApp[], userId: string) {
  return {
    apps,
    kernel: {
      name: 'etherdesk-kernel',
      version: '0.1.0',
      operations: ['auth.login', 'auth.logout', 'desktop.bootstrap', 'desktop.feedback'],
    },
    preferences: {
      satisfaction: satisfactionByUser.get(userId) ?? 0,
    },
  };
}

export function saveSatisfaction(userId: string, rating: number) {
  satisfactionByUser.set(userId, rating);
}
