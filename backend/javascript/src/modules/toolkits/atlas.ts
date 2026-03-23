import { atlasToolkitManifest } from './manifests/atlas.manifest.js';
import type { ToolkitDefinition } from './types.js';

export const atlasToolkit: ToolkitDefinition = {
  name: atlasToolkitManifest.name,
  description: atlasToolkitManifest.description,
  allowedRoles: atlasToolkitManifest.allowedRoles,
  tools: [
    {
      ...atlasToolkitManifest.tools[0],
      execute: () => ({
        ok: true,
        output: ['atlas toolkit', 'subcomandos disponibles:', 'atlas --help', 'atlas --status', 'atlas --list-apps'],
      }),
    },
    {
      ...atlasToolkitManifest.tools[1],
      execute: ({ userName, apps }) => ({
        ok: true,
        output: [
          'atlas status',
          'kernel: etherdesk-kernel 0.1.0',
          `user: ${userName}`,
          `apps: ${apps.length}`,
          'mode: controlled-toolkit',
        ],
      }),
    },
    {
      ...atlasToolkitManifest.tools[2],
      execute: ({ apps }) => ({
        ok: true,
        output: ['atlas apps', ...apps.map((app) => `${app.id} :: ${app.name}`)],
      }),
    },
  ],
};
