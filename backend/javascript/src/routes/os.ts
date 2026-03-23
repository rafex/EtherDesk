import type { IncomingMessage, ServerResponse } from 'node:http';
import { mockApps } from '../modules/apps.js';
import { getSession, updateUserProfile } from '../modules/auth.js';
import { activateWorkspaceFile, buildDesktopPayload, buildMonitorPayload, createWorkspaceFile, deleteWorkspaceFile, duplicateWorkspaceFile, executeTerminalCommand, renameWorkspaceFile, saveFeedback, saveNotesDraft, saveTerminalSnapshot, updatePreferences } from '../modules/os.js';
import { getBearerToken, readJsonBody, sendJson } from '../shared/http.js';

interface FeedbackBody {
  rating?: number;
  chips?: string[];
  comment?: string;
}

interface NotesBody {
  fileId?: string;
  name?: string;
  content?: string;
  updatedAt?: string;
}

interface TerminalBody {
  fileId?: string;
  name?: string;
  history?: string[];
  log?: string[];
  updatedAt?: string;
}

interface PreferencesBody {
  theme?: 'ocean' | 'sand';
  wallpaper?: 'ocean' | 'sunset' | 'graphite';
  browserAllowedHosts?: string[];
  defaultWindowSize?: {
    width?: number;
    height?: number;
  };
}

interface TerminalCommandBody {
  command?: string;
}

interface RenameFileBody {
  fileId?: string;
  name?: string;
}

interface DeleteFileBody {
  fileId?: string;
}

interface CreateFileBody {
  type?: 'notes' | 'terminal';
  name?: string;
}

interface ProfileBody {
  name?: string;
  email?: string;
}

interface ActivateFileBody {
  fileId?: string;
}

interface DuplicateFileBody {
  fileId?: string;
}

function isSafeTimestamp(value: string) {
  return Boolean(value) && !Number.isNaN(Date.parse(value));
}

function normalizeStringList(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= maxLength)
    .slice(0, maxItems);
}

function normalizeHostList(value: unknown) {
  return normalizeStringList(value, 10, 120).map((item) => item.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''));
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

    saveFeedback(session.user.id, {
      rating,
      chips: normalizeStringList(body?.chips, 10, 80),
      comment: typeof body?.comment === 'string' ? body.comment.trim().slice(0, 500) : '',
    });

    sendJson(response, 200, {
      data: {
        rating,
        chips: normalizeStringList(body?.chips, 10, 80),
        comment: typeof body?.comment === 'string' ? body.comment.trim().slice(0, 500) : '',
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

export async function handlePreferencesRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<PreferencesBody>(request);
    const width = body?.defaultWindowSize?.width;
    const height = body?.defaultWindowSize?.height;
    const preferences = updatePreferences(session.user.id, {
      theme: body?.theme,
      wallpaper: body?.wallpaper,
      browserAllowedHosts: body?.browserAllowedHosts ? normalizeHostList(body.browserAllowedHosts) : undefined,
      defaultWindowSize: typeof width === 'number' && typeof height === 'number' ? { width, height } : undefined,
    });

    sendJson(response, 200, {
      data: preferences,
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

export async function handleNotesSyncRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<NotesBody>(request);
    const fileId = typeof body?.fileId === 'string' ? body.fileId.trim() : '';
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const content = typeof body?.content === 'string' ? body.content.slice(0, 100_000) : '';
    const updatedAt = typeof body?.updatedAt === 'string' ? body.updatedAt : '';

    if (!fileId || !name || !isSafeTimestamp(updatedAt)) {
      sendJson(response, 400, {
        error: 'invalid_notes_payload',
        message: 'El fileId, el nombre y la fecha de actualizacion son obligatorios.',
      });
      return;
    }

    saveNotesDraft(session.user.id, fileId, name, content, updatedAt);

    sendJson(response, 200, {
      data: {
        updatedAt,
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

export async function handleTerminalSyncRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<TerminalBody>(request);
    const fileId = typeof body?.fileId === 'string' ? body.fileId.trim() : '';
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const history = normalizeStringList(body?.history, 500, 200);
    const log = normalizeStringList(body?.log, 2000, 500);
    const updatedAt = typeof body?.updatedAt === 'string' ? body.updatedAt : '';

    if (!fileId || !name || !isSafeTimestamp(updatedAt)) {
      sendJson(response, 400, {
        error: 'invalid_terminal_payload',
        message: 'El fileId, el nombre y la fecha de actualizacion son obligatorios.',
      });
      return;
    }

    saveTerminalSnapshot(session.user.id, fileId, name, history, log, updatedAt);

    sendJson(response, 200, {
      data: {
        updatedAt,
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

export async function handleTerminalExecuteRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<TerminalCommandBody>(request);
    const command = typeof body?.command === 'string' ? body.command.trim().slice(0, 120) : '';
    if (!command) {
      sendJson(response, 400, {
        error: 'invalid_command',
        message: 'El comando es obligatorio.',
      });
      return;
    }

    const result = executeTerminalCommand(session.user.id, command, session.user.name, session.user.role, mockApps);

    sendJson(response, result.ok ? 200 : 403, {
      data: result,
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

export async function handleFileRenameRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<RenameFileBody>(request);
    const fileId = typeof body?.fileId === 'string' ? body.fileId.trim() : '';
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';

    if (!fileId || !name) {
      sendJson(response, 400, {
        error: 'invalid_file_payload',
        message: 'El id del archivo y el nombre son obligatorios.',
      });
      return;
    }

    const file = renameWorkspaceFile(session.user.id, fileId, name);
    if (!file) {
      sendJson(response, 404, {
        error: 'file_not_found',
        message: 'El archivo solicitado no existe en el workspace.',
      });
      return;
    }

    sendJson(response, 200, {
      data: file,
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

export async function handleFileDeleteRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<DeleteFileBody>(request);
    const fileId = typeof body?.fileId === 'string' ? body.fileId.trim() : '';

    if (!fileId) {
      sendJson(response, 400, {
        error: 'invalid_file_payload',
        message: 'El id del archivo es obligatorio.',
      });
      return;
    }

    const deleted = deleteWorkspaceFile(session.user.id, fileId);
    if (!deleted) {
      sendJson(response, 404, {
        error: 'file_not_found',
        message: 'El archivo solicitado no existe en el workspace.',
      });
      return;
    }

    sendJson(response, 200, {
      data: {
        success: true,
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

export async function handleFileCreateRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<CreateFileBody>(request);
    const type = body?.type;

    if (type !== 'notes' && type !== 'terminal') {
      sendJson(response, 400, {
        error: 'invalid_file_type',
        message: 'Solo se permiten archivos virtuales notes o terminal.',
      });
      return;
    }

    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const file = createWorkspaceFile(session.user.id, type, name);
    sendJson(response, 200, {
      data: file,
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

export async function handleFileActivateRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<ActivateFileBody>(request);
    const fileId = typeof body?.fileId === 'string' ? body.fileId.trim() : '';
    if (!fileId) {
      sendJson(response, 400, {
        error: 'invalid_file_payload',
        message: 'El id del archivo es obligatorio.',
      });
      return;
    }

    const file = activateWorkspaceFile(session.user.id, fileId);
    if (!file) {
      sendJson(response, 404, {
        error: 'file_not_found',
        message: 'El archivo solicitado no existe en el workspace.',
      });
      return;
    }

    sendJson(response, 200, {
      data: file,
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

export async function handleFileDuplicateRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<DuplicateFileBody>(request);
    const fileId = typeof body?.fileId === 'string' ? body.fileId.trim() : '';
    if (!fileId) {
      sendJson(response, 400, {
        error: 'invalid_file_payload',
        message: 'El id del archivo es obligatorio.',
      });
      return;
    }

    const file = duplicateWorkspaceFile(session.user.id, fileId);
    if (!file) {
      sendJson(response, 404, {
        error: 'file_not_found',
        message: 'El archivo solicitado no existe en el workspace.',
      });
      return;
    }

    sendJson(response, 200, {
      data: file,
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

export async function handleProfileRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  try {
    const body = await readJsonBody<ProfileBody>(request);
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 160) : '';

    if (!name || !email.includes('@')) {
      sendJson(response, 400, {
        error: 'invalid_profile_payload',
        message: 'El nombre y el correo son obligatorios para actualizar el perfil.',
      });
      return;
    }

    const user = updateUserProfile(session.user.id, { name, email });
    sendJson(response, 200, {
      data: user,
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

export function handleMonitorRoute(request: IncomingMessage, response: ServerResponse) {
  const session = resolveSession(request, response);
  if (!session) {
    return;
  }

  sendJson(response, 200, {
    data: buildMonitorPayload(session.user.id, mockApps),
  });
}
