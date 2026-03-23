import { atlasToolkit } from './atlas.js';
import { kiwiToolkit } from './kiwi.js';
import { toolkitManifests } from './manifests/index.js';
import type { ToolkitDefinition } from './types.js';

export const toolkitRegistry: ToolkitDefinition[] = [kiwiToolkit, atlasToolkit];
export const toolkitManifestRegistry = toolkitManifests;
