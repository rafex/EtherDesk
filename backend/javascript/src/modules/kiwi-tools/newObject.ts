import { auditKernelEvent } from '../audit.js';
import type { KiwiToolDefinition } from './types.js';

function readOptionValue(rawCommand: string, option: string) {
  const match = rawCommand.match(new RegExp(`${option}\\s+([^\\s].*)$`, 'i'));
  return match?.[1]?.trim() ?? '';
}

export const kiwiNewObjectTool: KiwiToolDefinition = {
  flag: '--new-object',
  usage: 'kiwi --new-object --name <nombre>',
  description: 'Crea un objeto controlado mediante la API proxy de kiwi.',
  execute: ({ userId, rawCommand, kiwiObjects }) => {
    const name = readOptionValue(rawCommand, '--name').slice(0, 120);
    if (!name) {
      auditKernelEvent(userId, 'terminal.execute.denied', `Comando kiwi invalido: ${rawCommand}`, 'warning');
      return {
        ok: false,
        output: ['Uso permitido: kiwi --new-object --name <nombre>'],
      };
    }

    const object = {
      id: `kiwi-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
    kiwiObjects.push(object);
    auditKernelEvent(userId, 'terminal.execute.controlled.kiwi.new-object', `Kiwi creo un objeto: ${name}`);
    return {
      ok: true,
      output: ['kiwi api proxy', 'status: created', `objectId: ${object.id}`, `name: ${object.name}`],
    };
  },
};
