import { kiwiToolRegistry } from '../kiwi-tools/index.js';
import { kiwiToolkitManifest } from './manifests/kiwi.manifest.js';
import type { ToolkitDefinition } from './types.js';

export const kiwiToolkit: ToolkitDefinition = {
  name: kiwiToolkitManifest.name,
  description: kiwiToolkitManifest.description,
  allowedRoles: kiwiToolkitManifest.allowedRoles,
  tools: kiwiToolkitManifest.tools.map((manifestTool) => {
    const implementation = kiwiToolRegistry.find((tool) => tool.flag === manifestTool.flag);
    if (!implementation) {
      throw new Error(`Toolkit kiwi sin implementacion para ${manifestTool.flag}`);
    }

    return {
      flag: manifestTool.flag,
      usage: manifestTool.usage,
      description: manifestTool.description,
      allowedRoles: manifestTool.allowedRoles,
      execute: implementation.execute,
    };
  }),
};
