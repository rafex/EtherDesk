import type { ToolkitManifest } from '../types.js';

export const kiwiToolkitManifest: ToolkitManifest = {
  name: 'kiwi',
  description: 'Toolkit controlado para herramientas de Ether.',
  allowedRoles: ['owner', 'admin'],
  tools: [
    {
      flag: '--help',
      usage: 'kiwi --help',
      description: 'Muestra la ayuda del toolkit kiwi.',
      allowedRoles: ['owner', 'admin', 'support'],
    },
    {
      flag: '--list-objects',
      usage: 'kiwi --list-objects',
      description: 'Lista los objetos creados mediante el toolkit kiwi.',
      allowedRoles: ['owner', 'admin', 'support'],
    },
    {
      flag: '--new-object',
      usage: 'kiwi --new-object --name <nombre>',
      description: 'Crea un objeto controlado mediante la API proxy de kiwi.',
      allowedRoles: ['owner', 'admin'],
    },
  ],
};
