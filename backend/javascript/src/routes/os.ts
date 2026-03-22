import type { IncomingMessage, ServerResponse } from 'node:http';
import { mockApps } from '../modules/apps.js';
import { getSession } from '../modules/auth.js';
import { buildDesktopPayload, saveNotesDraft, saveSatisfaction, saveTerminalSnapshot } from '../modules/os.js';
import { getBearerToken, readJsonBody, sendJson } from '../shared/http.js';

interface FeedbackBody {
  rating?: number;
  chips?: string[];
  comment?: string;
}

interface NotesBody {
  content?: string;
  updatedAt?: string;
}

interface TerminalBody {
  history?: string[];
  log?: string[];
  updatedAt?: string;
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
        chips: Array.isArray(body?.chips) ? body.chips : [],
        comment: typeof body?.comment === 'string' ? body.comment : '',
      },
    });
  } catch {
    sendJson(response, 400, {
      error: 'invalid_body',
      message: 'El cuerpo de la peticion no es JSON valido.',
    });
  }
}

export async function handleNotesSyncRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<NotesBody>(request);
    const content = typeof body?.content === 'string' ? body.content : '';
    const updatedAt = typeof body?.updatedAt === 'string' ? body.updatedAt : '';

    if (!updatedAt) {
      sendJson(response, 400, {
        error: 'invalid_updated_at',
        message: 'La fecha de actualizacion es obligatoria.',
      });
      return;
    }

    saveNotesDraft(session.user.id, content, updatedAt);

    sendJson(response, 200, {
      data: {
        updatedAt,
      },
    });
  } catch {
    sendJson(response, 400, {
      error: 'invalid_body',
      message: 'El cuerpo de la peticion no es JSON valido.',
    });
  }
}

export async function handleTerminalSyncRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<TerminalBody>(request);
    const history = Array.isArray(body?.history) ? body.history.filter((item): item is string => typeof item === 'string') : [];
    const log = Array.isArray(body?.log) ? body.log.filter((item): item is string => typeof item === 'string') : [];
    const updatedAt = typeof body?.updatedAt === 'string' ? body.updatedAt : '';

    if (!updatedAt) {
      sendJson(response, 400, {
        error: 'invalid_updated_at',
        message: 'La fecha de actualizacion es obligatoria.',
      });
      return;
    }

    saveTerminalSnapshot(session.user.id, history, log, updatedAt);

    sendJson(response, 200, {
      data: {
        updatedAt,
      },
    });
  } catch {
    sendJson(response, 400, {
      error: 'invalid_body',
      message: 'El cuerpo de la peticion no es JSON valido.',
    });
  }
}
