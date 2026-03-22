export interface MockApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
}

export const mockApps: MockApp[] = [
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
    id: 'launcher',
    name: 'Launcher',
    description: 'Acceso a herramientas del sistema.',
    icon: 'L',
    route: '/apps/launcher',
  },
];
