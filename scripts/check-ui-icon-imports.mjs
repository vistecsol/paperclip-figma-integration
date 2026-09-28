import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { iconExports, rewriteIconImports } from '../operator/ui-icon-imports.mjs';
// Explicit local parser input: no install, network or full UI compilation.
const { parse } = await import(pathToFileURL(process.argv[2]));
const host = process.argv[3] ?? '/app';
const exports = iconExports(path.join(host, 'ui/node_modules/lucide-react'));
const parseCode = code => parse(code, {sourceType:'module', plugins:['typescript','jsx']}).program;
const fixture = `// import { Wrong } from 'lucide-react';
const text = "import { Wrong } from 'lucide-react';";
import { Folder as ProjectIcon, FileImage, Loader2 } from 'lucide-react';
import * as Catalog from 'lucide-react';
import { UnknownExport, X } from 'lucide-react';
const dynamic = import('lucide-react');`;
const out = rewriteIconImports(fixture, parseCode(fixture), exports).code;
const ast = parseCode(out);
const imports = ast.body.filter(n => n.type === 'ImportDeclaration');
assert.equal(imports[0].specifiers[0].local.name, 'ProjectIcon');
assert.equal(imports[0].source.value, exports.get('Folder'));
assert.equal(imports[2].source.value, exports.get('Loader2'));
assert.equal(imports[3].source.value, 'lucide-react');
assert.equal(imports[4].source.value, 'lucide-react');
assert.ok(out.includes('const text = "import { Wrong }'));
assert.ok(out.includes("import('lucide-react')"));
assert.equal(rewriteIconImports('export const x = 1;', parseCode('export const x = 1;'), exports), null);
const used = new Set(); let declarations = 0, fallbackDeclarations = 0;
function walk(dir) {
 for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
  const file = path.join(dir, entry.name);
  if (entry.isDirectory()) { walk(file); continue; }
  if (!/\.(tsx?|jsx?)$/.test(file) || /\.(test|stories)\./.test(file)) continue;
  const code = fs.readFileSync(file,'utf8');
  if (!code.includes('lucide-react')) continue;
  for (const node of parseCode(code).body) {
   if (node.type !== 'ImportDeclaration' || node.source.value !== 'lucide-react' || node.importKind === 'type') continue;
   const specs = node.specifiers.filter(s => s.importKind !== 'type');
   if (specs.every(s => s.type === 'ImportSpecifier' && exports.has(s.imported.name))) {
    declarations++; specs.forEach(s => used.add(exports.get(s.imported.name)));
   } else { fallbackDeclarations++; console.log(JSON.stringify({fallback:file, names:specs.map(s => s.imported?.name)})); }
  }
 }
}
walk(path.join(host,'ui/src'));
walk('host-prerequisite/ui/src/components');
const all = new Set(exports.values());
console.log(JSON.stringify({namedImportSemantics:'passed',sourceDeclarations:declarations,
 fallbackDeclarations, selectedIconModules:used.size, barrelIconModules:all.size,
 note:'Static source inventory, not measured build graph or peak memory.'},null,2));
// Small real bundler boundary: exercises this.parse and direct module linking.
if (process.argv[4]) {
 const {rollup} = await import(pathToFileURL(process.argv[4]));
 const {directIconImports} = await import('../operator/ui-icon-imports.mjs');
 const bundle = await rollup({input:'virtual:icons', external:['react'], plugins:[
  {name:'fixture',resolveId(id){if(id==='virtual:icons') return id;},load(id){if(id==='virtual:icons') return "import {Folder as ProjectIcon, FileImage, Loader2, createLucideIcon} from 'lucide-react'; export {ProjectIcon, FileImage, Loader2, createLucideIcon};";}},
  directIconImports(path.join(host,'ui/node_modules/lucide-react')),
 ]});
 const modules = [...bundle.watchFiles];
 assert.ok(!modules.some(id => id.endsWith('/lucide-react.mjs') || id.endsWith('/icons/index.mjs')));
 assert.ok(modules.includes(exports.get('Folder')));
 assert.ok(modules.includes(exports.get('FileImage')));
 const {output} = await bundle.generate({format:'es'});
 assert.deepEqual(output[0].exports.sort(), ['FileImage','Loader2','ProjectIcon','createLucideIcon'].sort());
 await bundle.close();
 console.log(JSON.stringify({realBundlerBoundary:'passed',fixtureModules:modules.length}));
}
