import { auditKernelEvent } from '../audit.js';
import { toolkitRegistry } from './config.js';
import type { ToolkitCommandContext, ToolkitCommandResult } from './types.js';

export function listToolkitUsages(userRole: string) {
  return toolkitRegistry
    .filter((toolkit) => toolkit.allowedRoles.includes(userRole))
    .flatMap((toolkit) =>
      toolkit.tools
        .filter((tool) => (tool.allowedRoles ?? toolkit.allowedRoles).includes(userRole))
        .map((tool) => tool.usage),
    );
}

export function executeToolkitCommand(context: ToolkitCommandContext): ToolkitCommandResult | null {
  const normalizedCommand = context.rawCommand.trim();
  const [toolkitName] = normalizedCommand.split(/\s+/);
  const toolkit = toolkitRegistry.find((item) => item.name === toolkitName?.toLowerCase());

  if (!toolkit) {
    return null;
  }

  if (!toolkit.allowedRoles.includes(context.userRole)) {
    auditKernelEvent(context.userId, 'terminal.execute.denied', `Toolkit ${toolkit.name} bloqueado para rol ${context.userRole}.`, 'warning');
    return {
      ok: false,
      output: [`El toolkit ${toolkit.name} no esta permitido para el rol ${context.userRole}.`],
    };
  }

  const tool = toolkit.tools.find((item) => normalizedCommand.includes(item.flag));
  if (!tool) {
    auditKernelEvent(context.userId, 'terminal.execute.denied', `Comando ${toolkit.name} invalido: ${context.rawCommand}`, 'warning');
    return {
      ok: false,
      output: [`Uso permitido: ${toolkit.tools.map((item) => item.usage).join(' | ')}`],
    };
  }

  const allowedRoles = tool.allowedRoles ?? toolkit.allowedRoles;
  if (!allowedRoles.includes(context.userRole)) {
    auditKernelEvent(
      context.userId,
      'terminal.execute.denied',
      `Comando ${tool.usage} bloqueado para rol ${context.userRole}.`,
      'warning',
    );
    return {
      ok: false,
      output: [`El comando ${tool.usage} no esta permitido para el rol ${context.userRole}.`],
    };
  }

  return tool.execute(context);
}
