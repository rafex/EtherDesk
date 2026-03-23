import type { IncomingMessage, ServerResponse } from 'node:http';

const ALLOWED_ORIGIN = process.env.ETHERDESK_ALLOWED_ORIGIN?.trim() || 'http://localhost:5173';
const MAX_JSON_BODY_BYTES = Number(process.env.ETHERDESK_MAX_JSON_BODY_BYTES || 1024 * 1024);

function resolveAllowedOrigin(requestOrigin?: string) {
  if (!requestOrigin) {
    return ALLOWED_ORIGIN;
  }

  return requestOrigin === ALLOWED_ORIGIN ? requestOrigin : ALLOWED_ORIGIN;
}

export function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': resolveAllowedOrigin(),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  });
  response.end(JSON.stringify(payload));
}

export async function readJsonBody<T>(request: IncomingMessage): Promise<T | null> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
    totalBytes += buffer.byteLength;

    if (totalBytes > MAX_JSON_BODY_BYTES) {
      throw new Error('payload_too_large');
    }

    chunks.push(buffer);
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

export function isOriginAllowed(request: IncomingMessage) {
  const origin = request.headers.origin;
  if (!origin) {
    return true;
  }

  return origin === ALLOWED_ORIGIN;
}
