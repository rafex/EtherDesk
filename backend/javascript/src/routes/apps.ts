import type { ServerResponse } from 'node:http';
import { mockApps } from '../modules/apps.js';
import { sendJson } from '../shared/http.js';

export function handleAppsRoute(response: ServerResponse) {
  sendJson(response, 200, {
    data: mockApps,
  });
}
