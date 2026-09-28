// Smoke-build optimization: bypass Lucide's side-effect-free full icon barrel.
// Keep unknown, namespace and dynamic imports on the original resolution path.
import fs from 'node:fs';
import path from 'node:path';

export function iconExports(packageRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  if (pkg.version !== '1.38.0' || pkg.sideEffects !== false) throw Error('Unverified Lucide package');
  const root = path.join(packageRoot, 'dist/esm');
  const exports = new Map();
  const barrel = fs.readFileSync(path.join(root, 'lucide-react.mjs'), 'utf8');
  for (const match of barrel.matchAll(/^export \{ ([^}]+) \} from '(\.\/(?:icons\/)?[a-zA-Z0-9-]+\.mjs)';$/gm)) {
    const target = path.resolve(root, match[2]);
    if (!fs.existsSync(target)) throw Error('Missing Lucide module');
    for (const spec of match[1].split(', ')) {
      const alias = /^default as (\w+)$/.exec(spec);
      if (alias) exports.set(alias[1], target);
    }
  }
  if (!exports.has('FileImage') || !exports.has('Folder')) throw Error('Lucide export contract changed');
  return exports;
}

export function rewriteIconImports(code, ast, exports) {
  const edits = [];
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration' || node.source.value !== 'lucide-react' || !node.specifiers.length) continue;
    // All-or-nothing per declaration: preserve helpers and namespace semantics.
    if (!node.specifiers.every(s => s.type === 'ImportSpecifier' && exports.has(s.imported.name))) continue;
    edits.push({ start: node.start, end: node.end, text: node.specifiers.map(s =>
      `import ${s.local.name} from ${JSON.stringify(exports.get(s.imported.name))};`).join('\n') });
  }
  if (!edits.length) return null;
  for (const edit of edits.reverse()) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  return { code, map: null };
}

export function directIconImports(packageRoot) {
  const exports = iconExports(packageRoot);
  return {
    name: 'vts-smoke-direct-lucide-icons', enforce: 'post', apply: 'build',
    transform(code, id) {
      if (id.includes('/node_modules/') || !code.includes('lucide-react')) return null;
      // Vite has already lowered TS/JSX. An unsupported parser shape leaves the
      // original import intact; never guess with regex replacement of source.
      let ast;
      try { ast = this.parse(code); } catch { return null; }
      return rewriteIconImports(code, ast, exports);
    },
  };
}
