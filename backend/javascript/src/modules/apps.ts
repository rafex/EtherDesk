export interface MockApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  url?: string;
}

export const mockApps: MockApp[] = [
  {
    id: 'browser',
    name: 'Browser',
    description: 'Navegador web conceptual dentro de EtherDesk.',
    icon: 'browser',
    route: '/apps/browser',
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Editor de texto simple.',
    icon: 'notes',
    route: '/apps/notes',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Terminal controlada.',
    icon: 'terminal',
    route: '/apps/terminal',
  },
  {
    id: 'files',
    name: 'Files',
    description: 'Explorador minimo de archivos locales del workspace.',
    icon: 'files',
    route: '/apps/files',
  },
  {
    id: 'system-monitor',
    name: 'System Monitor',
    description: 'Estado del sistema web, kernel y PWA.',
    icon: 'monitor',
    route: '/apps/system-monitor',
  },
  {
    id: 'notification-center',
    name: 'Notifications',
    description: 'Centro completo de notificaciones y eventos.',
    icon: 'notifications',
    route: '/apps/notifications',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configuracion visual del sistema.',
    icon: 'settings',
    route: '/apps/settings',
  },
  {
    id: 'account',
    name: 'Account',
    description: 'Perfil, sesion y estado del usuario.',
    icon: 'account',
    route: '/apps/account',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Trabajos pendientes y sincronizaciones offline.',
    icon: 'tasks',
    route: '/apps/tasks',
  },
  {
    id: 'help',
    name: 'Help',
    description: 'Guia rapida del sistema y sus limitaciones.',
    icon: 'help',
    route: '/apps/help',
  },
  {
    id: 'tars-chat',
    name: 'TARS Chat',
    description: 'Asistente local del sistema para ayuda rapida.',
    icon: 'chat',
    route: '/apps/tars-chat',
  },
];
