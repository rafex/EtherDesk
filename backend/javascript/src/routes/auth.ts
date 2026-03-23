import type { IncomingMessage, ServerResponse } from 'node:http';
import { getSession, loginWithPassword, logoutSession, refreshSession } from '../modules/auth.js';
import { getBearerToken, readJsonBody, sendJson } from '../shared/http.js';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function handleLoginRoute(request: IncomingMessage, response: ServerResponse) {
  try {
    const body = await readJsonBody<LoginBody>(request);
    const email = body?.email?.trim() ?? '';
    const password = body?.password ?? '';

    if (!email || !password || email.length > 160 || password.length > 160) {
      sendJson(response, 400, {
        error: 'invalid_credentials_payload',
        message: 'El payload de autenticacion no es valido.',
      });
      return;
    }

    const result = loginWithPassword(email, password);
    if (!result.ok) {
      sendJson(response, result.statusCode, {
        error: result.error,
        message: result.message,
      });
      return;
    }

    sendJson(response, 200, {
      data: {
        token: result.token,
        user: result.user,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error && error.message === 'payload_too_large' ? 'payload_too_large' : 'invalid_body',
      message:
        error instanceof Error && error.message === 'payload_too_large'
          ? 'El cuerpo de la peticion excede el tamano permitido.'
          : 'El cuerpo de la peticion no es JSON valido.',
    });
  }
}

export function handleSessionRoute(request: IncomingMessage, response: ServerResponse) {
  const token = getBearerToken(request);
  const session = getSession(token);

  if (!session) {
    sendJson(response, 401, {
      error: 'invalid_session',
      message: 'La sesion no es valida.',
    });
    return;
  }

  sendJson(response, 200, {
    data: {
      token: session.token,
      user: session.user,
      expiresAt: session.expiresAt,
    },
  });
}

export function handleRefreshRoute(request: IncomingMessage, response: ServerResponse) {
  const token = getBearerToken(request);
  const session = refreshSession(token);

  if (!session) {
    sendJson(response, 401, {
      error: 'invalid_session',
      message: 'La sesion no es valida o ya expiro.',
    });
    return;
  }

  sendJson(response, 200, {
    data: {
      token: session.token,
      user: session.user,
      expiresAt: session.expiresAt,
    },
  });
}

export function handleLogoutRoute(request: IncomingMessage, response: ServerResponse) {
  const token = getBearerToken(request);
  logoutSession(token);

  sendJson(response, 200, {
    data: {
      success: true,
    },
  });
}
