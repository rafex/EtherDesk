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
    icon: 'B',
    route: '/apps/browser',
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Editor de texto simple.',
    icon: 'N',
    route: '/apps/notes',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Terminal controlada.',
    icon: 'T',
    route: '/apps/terminal',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configuracion visual del sistema.',
    icon: 'S',
    route: '/apps/settings',
  },
  {
    id: 'tars-chat',
    name: 'TARS Chat',
    description: 'Asistente local del sistema para ayuda rapida.',
    icon: 'C',
    route: '/apps/tars-chat',
  },
];
