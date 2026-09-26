import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { designApiRoutes } from '../src/api.mjs';
// Run with the host's tsx loader; validates actual schema, not a copied facsimile.
const host = resolve(process.argv[2] ?? '/app');
const { pluginApiRouteDeclarationSchema } = await import(pathToFileURL(`${host}/packages/shared/src/validators/plugin.ts`));
for (const route of designApiRoutes) pluginApiRouteDeclarationSchema.parse(route);
console.log(`${designApiRoutes.length} route declarations accepted by host schema`);
