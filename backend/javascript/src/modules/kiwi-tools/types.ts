import type { ToolkitCommandContext, ToolkitCommandResult } from '../toolkits/types.js';

export interface KiwiToolDefinition {
  flag: string;
  usage: string;
  description: string;
  execute: (context: ToolkitCommandContext) => ToolkitCommandResult;
}
