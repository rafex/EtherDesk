import type { ToolkitManifest } from '../types.js';

export const atlasToolkitManifest: ToolkitManifest = {
  name: 'atlas',
  description: 'Toolkit controlado para inspeccion del sistema EtherDesk.',
  allowedRoles: ['owner', 'admin', 'support'],
  tools: [
    {
      flag: '--help',
      usage: 'atlas --help',
      description: 'Muestra la ayuda del toolkit atlas.',
    },
    {
      flag: '--status',
      usage: 'atlas --status',
      description: 'Muestra un resumen controlado del kernel.',
    },
    {
      flag: '--list-apps',
      usage: 'atlas --list-apps',
      description: 'Lista apps registradas en el desktop.',
    },
  ],
};
