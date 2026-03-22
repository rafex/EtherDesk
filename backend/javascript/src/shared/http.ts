import type { IncomingMessage, ServerResponse } from 'node:http';

export function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  response.end(JSON.stringify(payload));
}

export async function readJsonBody<T>(request: IncomingMessage): Promise<T | null> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  const rawBody = Buffer.concat(chunks).toString('utf-8').trim();
  if (!rawBody) {
    return null;
  }

  return JSON.parse(rawBody) as T;
}

export function getBearerToken(request: IncomingMessage) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim() || null;
}
