import type { MockApp } from '../apps.js';
import type { KiwiObjectRecord } from '../kiwi.js';

export interface ToolkitCommandContext {
  userId: string;
  userName: string;
  userRole: string;
  rawCommand: string;
  apps: MockApp[];
  kiwiObjects: KiwiObjectRecord[];
}

export interface ToolkitCommandResult {
  ok: boolean;
  output: string[];
}

export interface ToolkitToolDefinition {
  flag: string;
  usage: string;
  description: string;
  allowedRoles?: string[];
  execute: (context: ToolkitCommandContext) => ToolkitCommandResult;
}

export interface ToolkitDefinition {
  name: string;
  description: string;
  allowedRoles: string[];
  tools: ToolkitToolDefinition[];
}

export interface ToolkitToolManifest {
  flag: string;
  usage: string;
  description: string;
  allowedRoles?: string[];
}

export interface ToolkitManifest {
  name: string;
  description: string;
  allowedRoles: string[];
  tools: ToolkitToolManifest[];
}
