import { createServer } from 'node:http';
import { handleAppsRoute } from './routes/apps.js';
import { handleLoginRoute, handleLogoutRoute, handleRefreshRoute, handleSessionRoute } from './routes/auth.js';
import {
  handleDesktopRoute,
  handleFileActivateRoute,
  handleFileDuplicateRoute,
  handleFeedbackRoute,
  handleFileCreateRoute,
  handleFileDeleteRoute,
  handleFileRenameRoute,
  handleMonitorRoute,
  handleNotesSyncRoute,
  handleProfileRoute,
  handlePreferencesRoute,
  handleTerminalExecuteRoute,
  handleTerminalSyncRoute,
} from './routes/os.js';
import { isOriginAllowed, sendJson } from './shared/http.js';

const PORT = Number(process.env.PORT || 3010);
const RATE_LIMIT_WINDOW_MS = Number(process.env.ETHERDESK_RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.ETHERDESK_RATE_LIMIT_MAX_REQUESTS || 120);
const RATE_LIMIT_MAX_AUTH_REQUESTS = Number(process.env.ETHERDESK_RATE_LIMIT_MAX_AUTH_REQUESTS || 20);
const RATE_LIMIT_MAX_TERMINAL_REQUESTS = Number(process.env.ETHERDESK_RATE_LIMIT_MAX_TERMINAL_REQUESTS || 45);

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitKey(method: string, url: string) {
  if (url.startsWith('/api/auth/')) {
    return `${method}:auth`;
  }

  if (url === '/api/os/terminal/execute') {
    return `${method}:terminal`;
  }

  return `${method}:default`;
}

function resolveRateLimit(method: string, url: string) {
  const key = rateLimitKey(method, url);

  if (key.endsWith(':auth')) {
    return RATE_LIMIT_MAX_AUTH_REQUESTS;
  }

  if (key.endsWith(':terminal')) {
    return RATE_LIMIT_MAX_TERMINAL_REQUESTS;
  }

  return RATE_LIMIT_MAX_REQUESTS;
}

function isRateLimited(requestMethod: string, requestUrl: string, remoteAddress: string) {
  const bucketKey = `${remoteAddress}:${rateLimitKey(requestMethod, requestUrl)}`;
  const currentTime = Date.now();
  const currentBucket = requestBuckets.get(bucketKey);

  if (!currentBucket || currentBucket.resetAt <= currentTime) {
    requestBuckets.set(bucketKey, {
      count: 1,
      resetAt: currentTime + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  currentBucket.count += 1;
  return currentBucket.count > resolveRateLimit(requestMethod, requestUrl);
}

function getRateLimitResetSeconds(requestMethod: string, requestUrl: string, remoteAddress: string) {
  const bucketKey = `${remoteAddress}:${rateLimitKey(requestMethod, requestUrl)}`;
  const bucket = requestBuckets.get(bucketKey);
  if (!bucket) {
    return 1;
  }

  return Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000));
}

const server = createServer((request, response) => {
  const requestUrl = request.url || '/';
  const requestMethod = request.method || 'GET';
  const remoteAddress = request.socket.remoteAddress || 'unknown';

  if (!isOriginAllowed(request)) {
    sendJson(response, 403, {
      error: 'origin_not_allowed',
      message: 'El origen de la peticion no esta permitido.',
    });
    return;
  }

  if (isRateLimited(requestMethod, requestUrl, remoteAddress)) {
    response.setHeader('Retry-After', String(getRateLimitResetSeconds(requestMethod, requestUrl, remoteAddress)));
    sendJson(response, 429, {
      error: 'rate_limited',
      message: 'Se excedio el limite de peticiones del backend mock.',
    });
    return;
  }

  if (requestMethod === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (requestMethod === 'GET' && requestUrl === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'etherdesk-backend-mock',
    });
    return;
  }

  if (requestMethod === 'GET' && requestUrl === '/api/apps') {
    handleAppsRoute(response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/auth/login') {
    void handleLoginRoute(request, response);
    return;
  }

  if (requestMethod === 'GET' && requestUrl === '/api/auth/session') {
    handleSessionRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/auth/refresh') {
    handleRefreshRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/auth/logout') {
    handleLogoutRoute(request, response);
    return;
  }

  if (requestMethod === 'GET' && requestUrl === '/api/os/desktop') {
    handleDesktopRoute(request, response);
    return;
  }

  if (requestMethod === 'GET' && requestUrl === '/api/os/monitor') {
    handleMonitorRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/feedback') {
    void handleFeedbackRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/preferences') {
    void handlePreferencesRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/notes/sync') {
    void handleNotesSyncRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/terminal/sync') {
    void handleTerminalSyncRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/terminal/execute') {
    void handleTerminalExecuteRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/files/rename') {
    void handleFileRenameRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/files/create') {
    void handleFileCreateRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/files/activate') {
    void handleFileActivateRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/files/duplicate') {
    void handleFileDuplicateRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/files/delete') {
    void handleFileDeleteRoute(request, response);
    return;
  }

  if (requestMethod === 'POST' && requestUrl === '/api/os/account/profile') {
    void handleProfileRoute(request, response);
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

setInterval(() => {
  const now = Date.now();
  requestBuckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) {
      requestBuckets.delete(key);
    }
  });
}, RATE_LIMIT_WINDOW_MS).unref();
