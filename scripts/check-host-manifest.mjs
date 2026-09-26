import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import manifest from '../dist/manifest.mjs';
const host = resolve(process.argv[2] ?? '/app');
const { pluginManifestV1Schema } = await import(pathToFileURL(`${host}/packages/shared/src/validators/plugin.ts`));
pluginManifestV1Schema.parse(manifest);
console.log('Native plugin manifest schema accepted');
