import type { KiwiToolDefinition } from './types.js';

export const kiwiHelpTool: KiwiToolDefinition = {
  flag: '--help',
  usage: 'kiwi --help',
  description: 'Muestra la ayuda del toolkit kiwi.',
  execute: () => ({
    ok: true,
    output: [
      'kiwi toolkit',
      'subcomandos disponibles:',
      'kiwi --help',
      'kiwi --list-objects',
      'kiwi --new-object --name <nombre>',
    ],
  }),
};
