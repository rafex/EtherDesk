import { createServer } from 'node:http';
import { handleAppsRoute } from './routes/apps.js';
import { handleLoginRoute, handleLogoutRoute, handleSessionRoute } from './routes/auth.js';
import { handleDesktopRoute, handleFeedbackRoute, handleNotesSyncRoute, handleTerminalSyncRoute } from './routes/os.js';
import { sendJson } from './shared/http.js';

const PORT = Number(process.env.PORT || 3010);

const server = createServer((request, response) => {
  const requestUrl = request.url || '/';

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && requestUrl === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'etherdesk-backend-mock',
    });
    return;
  }

  if (request.method === 'GET' && requestUrl === '/api/apps') {
    handleAppsRoute(response);
    return;
  }

  if (request.method === 'POST' && requestUrl === '/api/auth/login') {
    void handleLoginRoute(request, response);
    return;
  }

  if (request.method === 'GET' && requestUrl === '/api/auth/session') {
    handleSessionRoute(request, response);
    return;
  }

  if (request.method === 'POST' && requestUrl === '/api/auth/logout') {
    handleLogoutRoute(request, response);
    return;
  }

  if (request.method === 'GET' && requestUrl === '/api/os/desktop') {
    handleDesktopRoute(request, response);
    return;
  }

  if (request.method === 'POST' && requestUrl === '/api/os/feedback') {
    void handleFeedbackRoute(request, response);
    return;
  }

  if (request.method === 'POST' && requestUrl === '/api/os/notes/sync') {
    void handleNotesSyncRoute(request, response);
    return;
  }

  if (request.method === 'POST' && requestUrl === '/api/os/terminal/sync') {
    void handleTerminalSyncRoute(request, response);
    return;
  }

  sendJson(response, 404, {
    error: 'not_found',
  });
});

server.listen(PORT, () => {
  console.log(`EtherDesk mock backend listening on http://localhost:${PORT}`);

  if (!process.env.ETHERDESK_AUTH_EMAIL || !process.env.ETHERDESK_AUTH_PASSWORD) {
    console.warn('EtherDesk auth is not configured. Set ETHERDESK_AUTH_EMAIL and ETHERDESK_AUTH_PASSWORD.');
  }
});
