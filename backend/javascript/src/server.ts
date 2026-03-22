import { createServer } from 'node:http';
import { handleAppsRoute } from './routes/apps.js';
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

  sendJson(response, 404, {
    error: 'not_found',
  });
});

server.listen(PORT, () => {
  console.log(`EtherDesk mock backend listening on http://localhost:${PORT}`);
});
