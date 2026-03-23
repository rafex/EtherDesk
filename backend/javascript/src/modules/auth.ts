import { randomUUID } from 'node:crypto';
import { auditKernelEvent } from './audit.js';

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
  expiresAt: string;
}

interface LoginResultSuccess {
  ok: true;
  token: string;
  user: AuthUser;
  expiresAt: string;
}

interface LoginResultFailure {
  ok: false;
  statusCode: number;
  error: string;
  message: string;
}

type LoginResult = LoginResultSuccess | LoginResultFailure;

const sessions = new Map<string, SessionRecord>();
const userProfiles = new Map<string, AuthUser>();
const SESSION_TTL_MS = Number(process.env.ETHERDESK_SESSION_TTL_MS || 1000 * 60 * 60 * 8);
const REFRESH_WINDOW_MS = Number(process.env.ETHERDESK_SESSION_REFRESH_WINDOW_MS || 1000 * 60 * 30);

function configuredCredentials() {
  const email = process.env.ETHERDESK_AUTH_EMAIL?.trim();
  const password = process.env.ETHERDESK_AUTH_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

function buildUser(email: string): AuthUser {
  const storedProfile = userProfiles.get('etherdesk-user');
  if (storedProfile) {
    return {
      ...storedProfile,
      email,
    };
  }

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
    auditKernelEvent('auth:system', 'auth.login.unavailable', 'Intento de login con autenticacion no configurada.', 'error');
    return {
      ok: false,
      statusCode: 503,
      error: 'auth_not_configured',
      message: 'El backend no tiene credenciales configuradas en ETHERDESK_AUTH_EMAIL y ETHERDESK_AUTH_PASSWORD.',
    };
  }

  if (email.trim().toLowerCase() !== credentials.email.toLowerCase() || password !== credentials.password) {
    auditKernelEvent('auth:anonymous', 'auth.login.failed', `Intento fallido para ${email.trim().toLowerCase() || 'unknown'}.`, 'warning');
    return {
      ok: false,
      statusCode: 401,
      error: 'invalid_credentials',
      message: 'Las credenciales no son validas.',
    };
  }

  const token = randomUUID();
  const user = buildUser(credentials.email);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  sessions.set(token, {
    token,
    user,
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  auditKernelEvent(user.id, 'auth.login.success', `Sesion iniciada para ${user.email}.`);

  return {
    ok: true,
    token,
    user,
    expiresAt,
  };
}

export function getSession(token: string | null) {
  if (!token) {
    return null;
  }

  const session = sessions.get(token) ?? null;
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
}

export function refreshSession(token: string | null) {
  const session = getSession(token);
  if (!session) {
    return null;
  }

  const expiresAtTime = new Date(session.expiresAt).getTime();
  const shouldRotate = expiresAtTime - Date.now() <= REFRESH_WINDOW_MS;
  if (!shouldRotate) {
    auditKernelEvent(session.user.id, 'auth.session.refresh.skipped', 'La sesion sigue vigente y no requiere rotacion.');
    return session;
  }

  sessions.delete(session.token);
  const nextToken = randomUUID();
  const refreshedSession: SessionRecord = {
    ...session,
    token: nextToken,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  sessions.set(nextToken, refreshedSession);
  auditKernelEvent(session.user.id, 'auth.session.refresh', 'Sesion renovada por ventana de expiracion.');
  return refreshedSession;
}

export function logoutSession(token: string | null) {
  if (!token) {
    return false;
  }
  const session = sessions.get(token);
  const deleted = sessions.delete(token);
  if (session && deleted) {
    auditKernelEvent(session.user.id, 'auth.logout', `Sesion cerrada para ${session.user.email}.`);
  }
  return deleted;
}

export function sessionTtlSeconds() {
  return Math.floor(SESSION_TTL_MS / 1000);
}

export function updateUserProfile(userId: string, patch: { name?: string; email?: string }) {
  const currentProfile =
    userProfiles.get(userId) ||
    ({
      id: userId,
      name: 'EtherDesk',
      email: configuredCredentials()?.email || 'demo@rafex.dev',
      role: 'owner',
    } satisfies AuthUser);

  const nextProfile: AuthUser = {
    ...currentProfile,
    name: patch.name?.trim() || currentProfile.name,
    email: patch.email?.trim() || currentProfile.email,
  };

  userProfiles.set(userId, nextProfile);

  sessions.forEach((session, token) => {
    if (session.user.id === userId) {
      sessions.set(token, {
        ...session,
        user: nextProfile,
      });
    }
  });

  auditKernelEvent(userId, 'account.profile.update', `Perfil actualizado para ${nextProfile.email}.`);
  return nextProfile;
}
