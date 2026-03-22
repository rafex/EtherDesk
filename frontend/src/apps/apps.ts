import type { AppShortcut } from '@/shared/types';

export const desktopApps: AppShortcut[] = [
  {
    id: 'browser',
    name: 'Browser',
    description: 'Navegador web conceptual dentro de EtherDesk.',
    icon: 'browser',
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Editor de texto simple para la PoC.',
    icon: 'notes',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Terminal controlada y limitada.',
    icon: 'terminal',
  },
  {
    id: 'files',
    name: 'Files',
    description: 'Explorador minimo de archivos locales del workspace.',
    icon: 'files',
  },
  {
    id: 'system-monitor',
    name: 'System Monitor',
    description: 'Estado del sistema web, kernel y PWA.',
    icon: 'monitor',
  },
  {
    id: 'notification-center',
    name: 'Notifications',
    description: 'Centro completo de notificaciones y eventos.',
    icon: 'notifications',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configuracion visual del sistema.',
    icon: 'settings',
  },
  {
    id: 'account',
    name: 'Account',
    description: 'Perfil, sesion y estado del usuario.',
    icon: 'account',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Trabajos pendientes y sincronizaciones offline.',
    icon: 'tasks',
  },
  {
    id: 'help',
    name: 'Help',
    description: 'Guia rapida del sistema y sus limitaciones.',
    icon: 'help',
  },
  {
    id: 'tars-chat',
    name: 'TARS Chat',
    description: 'Asistente local del sistema para ayuda rapida.',
    icon: 'chat',
  },
];
