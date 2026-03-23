import type { KiwiToolDefinition } from './types.js';

export const kiwiListObjectsTool: KiwiToolDefinition = {
  flag: '--list-objects',
  usage: 'kiwi --list-objects',
  description: 'Lista los objetos creados mediante el toolkit kiwi.',
  execute: ({ kiwiObjects }) => ({
    ok: true,
    output:
      kiwiObjects.length > 0
        ? ['kiwi objects', ...kiwiObjects.map((object) => `${object.id} :: ${object.name} :: ${object.createdAt}`)]
        : ['kiwi objects', 'sin objetos creados'],
  }),
};
