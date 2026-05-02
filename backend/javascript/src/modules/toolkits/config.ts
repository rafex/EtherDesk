import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { atlasToolkit } from './atlas.js';
import { kiwiToolkit } from './kiwi.js';
import { toolkitManifests } from './manifests/index.js';
import type { ToolkitDefinition, ToolkitManifest } from './types.js';

const builtInToolkitRegistry: ToolkitDefinition[] = [kiwiToolkit, atlasToolkit];

function resolveManifestDirectory() {
  const configured = process.env.ETHERDESK_TOOLKIT_MANIFESTS_DIR?.trim();
  if (!configured) {
    return null;
  }

  return isAbsolute(configured) ? configured : join(process.cwd(), configured);
}

function readExternalToolkitManifests() {
  const directory = resolveManifestDirectory();
  if (!directory || !existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.json'))
    .flatMap((fileName) => {
      try {
        const rawValue = readFileSync(join(directory, fileName), 'utf8');
        const parsed = JSON.parse(rawValue) as unknown;
        validateToolkitManifest(parsed, fileName);
        return parsed?.name ? [parsed] : [];
      } catch (error) {
        throw new Error(
          `Toolkit manifest invalido en ${fileName}: ${error instanceof Error ? error.message : 'error desconocido'}`,
        );
      }
    });
}

function validateToolkitManifest(value: unknown, fileName: string): asserts value is ToolkitManifest {
  if (!value || typeof value !== 'object') {
    throw new Error(`${fileName} debe ser un objeto JSON.`);
  }

  const manifest = value as Partial<ToolkitManifest>;
  if (!manifest.name || typeof manifest.name !== 'string') {
    throw new Error(`${fileName} requiere 'name' string.`);
  }

  if (!manifest.description || typeof manifest.description !== 'string') {
    throw new Error(`${fileName} requiere 'description' string.`);
  }

  if (!Array.isArray(manifest.allowedRoles) || manifest.allowedRoles.some((role) => typeof role !== 'string')) {
    throw new Error(`${fileName} requiere 'allowedRoles' como arreglo de strings.`);
  }

  if (!Array.isArray(manifest.tools) || manifest.tools.length === 0) {
    throw new Error(`${fileName} requiere 'tools' como arreglo no vacio.`);
  }

  manifest.tools.forEach((tool, index) => {
    if (!tool || typeof tool !== 'object') {
      throw new Error(`${fileName} tool[${index}] debe ser un objeto.`);
    }

    const currentTool = tool as ToolkitManifest['tools'][number];
    if (!currentTool.flag || typeof currentTool.flag !== 'string') {
      throw new Error(`${fileName} tool[${index}] requiere 'flag' string.`);
    }

    if (!currentTool.usage || typeof currentTool.usage !== 'string') {
      throw new Error(`${fileName} tool[${index}] requiere 'usage' string.`);
    }

    if (!currentTool.description || typeof currentTool.description !== 'string') {
      throw new Error(`${fileName} tool[${index}] requiere 'description' string.`);
    }

    if (
      currentTool.allowedRoles !== undefined &&
      (!Array.isArray(currentTool.allowedRoles) || currentTool.allowedRoles.some((role) => typeof role !== 'string'))
    ) {
      throw new Error(`${fileName} tool[${index}] requiere 'allowedRoles' como arreglo de strings.`);
    }
  });
}

function mergeManifest(baseManifest: ToolkitManifest, overrideManifest?: ToolkitManifest) {
  if (!overrideManifest) {
    return baseManifest;
  }

  const toolOverrides = new Map(overrideManifest.tools.map((tool) => [tool.flag, tool]));
  return {
    ...baseManifest,
    description: overrideManifest.description || baseManifest.description,
    allowedRoles: overrideManifest.allowedRoles?.length ? overrideManifest.allowedRoles : baseManifest.allowedRoles,
    tools: baseManifest.tools.map((tool) => {
      const overrideTool = toolOverrides.get(tool.flag);
      return overrideTool
        ? {
            ...tool,
            ...overrideTool,
            allowedRoles: overrideTool.allowedRoles?.length ? overrideTool.allowedRoles : tool.allowedRoles,
          }
        : tool;
    }),
  } satisfies ToolkitManifest;
}

const externalToolkitManifestRegistry = readExternalToolkitManifests();
export const toolkitManifestRegistry = toolkitManifests.map((manifest) =>
  mergeManifest(
    manifest,
    externalToolkitManifestRegistry.find((overrideManifest) => overrideManifest.name === manifest.name),
  ),
);

export const toolkitRegistry: ToolkitDefinition[] = builtInToolkitRegistry.map((toolkit) => {
  const manifest = toolkitManifestRegistry.find((item) => item.name === toolkit.name);
  if (!manifest) {
    return toolkit;
  }

  return {
    ...toolkit,
    description: manifest.description,
    allowedRoles: manifest.allowedRoles,
    tools: toolkit.tools.map((tool) => {
      const manifestTool = manifest.tools.find((item) => item.flag === tool.flag);
      return manifestTool
        ? {
            ...tool,
            usage: manifestTool.usage,
            description: manifestTool.description,
            allowedRoles: manifestTool.allowedRoles,
          }
        : tool;
    }),
  };
});
