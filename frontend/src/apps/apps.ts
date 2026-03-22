import type { AppShortcut } from '@/shared/types';

export const desktopApps: AppShortcut[] = [
  {
    id: 'notes',
    name: 'Notes',
    description: 'Editor de texto simple para la PoC.',
    icon: 'N',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Terminal controlada y limitada.',
    icon: 'T',
  },
  {
    id: 'launcher',
    name: 'Launcher',
    description: 'Acceso a aplicaciones registradas.',
    icon: 'L',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configuracion visual del sistema.',
    icon: 'S',
  },
  {
    id: 'tars-chat',
    name: 'TARS Chat',
    description: 'Asistente local del sistema para ayuda rapida.',
    icon: 'C',
  },
];
