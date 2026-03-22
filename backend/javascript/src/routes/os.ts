import type { IncomingMessage, ServerResponse } from 'node:http';
import { mockApps } from '../modules/apps.js';
import { getSession } from '../modules/auth.js';
import { buildDesktopPayload, saveSatisfaction } from '../modules/os.js';
import { getBearerToken, readJsonBody, sendJson } from '../shared/http.js';

interface FeedbackBody {
  rating?: number;
}

function resolveSession(request: IncomingMessage, response: ServerResponse) {
  const session = getSession(getBearerToken(request));
  if (!session) {
    sendJson(response, 401, {
      error: 'invalid_session',
      message: 'La sesion no es valida.',
    });
    return null;
  }

  return session;
}

export function handleDesktopRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  sendJson(response, 200, {
    data: {
      user: session.user,
      ...buildDesktopPayload(mockApps, session.user.id),
    },
  });
}

export async function handleFeedbackRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<FeedbackBody>(request);
    const rating = Number(body?.rating ?? 0);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      sendJson(response, 400, {
        error: 'invalid_rating',
        message: 'La calificacion debe ser un entero entre 1 y 5.',
      });
      return;
    }

    saveSatisfaction(session.user.id, rating);

    sendJson(response, 200, {
      data: {
        rating,
      },
    });
  } catch {
    sendJson(response, 400, {
      error: 'invalid_body',
      message: 'El cuerpo de la peticion no es JSON valido.',
    });
  }
}
