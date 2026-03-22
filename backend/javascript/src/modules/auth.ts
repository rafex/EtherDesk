import { randomUUID } from 'node:crypto';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SessionRecord {
  token: string;
  user: AuthUser;
  createdAt: string;
}

interface LoginResultSuccess {
  ok: true;
  token: string;
  user: AuthUser;
}

interface LoginResultFailure {
  ok: false;
  statusCode: number;
  error: string;
  message: string;
}

type LoginResult = LoginResultSuccess | LoginResultFailure;

const sessions = new Map<string, SessionRecord>();

function configuredCredentials() {
  const email = process.env.ETHERDESK_AUTH_EMAIL?.trim();
  const password = process.env.ETHERDESK_AUTH_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

function buildUser(email: string): AuthUser {
  const localName = email.split('@')[0] || 'etherdesk';
  const normalizedName = localName
    .split(/[.\-_]/g)
    .filter(Boolean)
    .map((fragment) => fragment.charAt(0).toUpperCase() + fragment.slice(1))
    .join(' ');

  return {
    id: 'etherdesk-user',
    name: normalizedName || 'EtherDesk',
    email,
    role: 'owner',
  };
}

export function loginWithPassword(email: string, password: string): LoginResult {
  const credentials = configuredCredentials();
  if (!credentials) {
    return {
      ok: false,
      statusCode: 503,
      error: 'auth_not_configured',
      message: 'El backend no tiene credenciales configuradas en ETHERDESK_AUTH_EMAIL y ETHERDESK_AUTH_PASSWORD.',
    };
  }

  if (email.trim().toLowerCase() !== credentials.email.toLowerCase() || password !== credentials.password) {
    return {
      ok: false,
      statusCode: 401,
      error: 'invalid_credentials',
      message: 'Las credenciales no son validas.',
    };
  }

  const token = randomUUID();
  const user = buildUser(credentials.email);

  sessions.set(token, {
    token,
    user,
    createdAt: new Date().toISOString(),
  });

  return {
    ok: true,
    token,
    user,
  };
}

export function getSession(token: string | null) {
  if (!token) {
    return null;
  }

  return sessions.get(token) ?? null;
}

export function logoutSession(token: string | null) {
  if (!token) {
    return false;
  }

  return sessions.delete(token);
}
