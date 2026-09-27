import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modelSourceHash } from '../../Browser/model-build-inputs.mjs';

export const desktop = fileURLToPath(new URL('../', import.meta.url));
export const webSource = fileURLToPath(new URL('../../Browser/dist/', import.meta.url));
export const webTarget = join(desktop, 'web');

export async function validateCompiled(source, expectedSourceHash) {
  const manifest = JSON.parse(await readFile(join(source, 'compiled/manifest.json'), 'utf8'));
  if (manifest.sourceHash !== expectedSourceHash) throw new Error('Compiled models are stale. Run npm run build:models in Browser.');
  if (!/^aerial-[a-f0-9]+\.bin\.gz$/.test(manifest.file)) throw new Error('Invalid compiled model filename');
  const binary = await readFile(join(source, 'compiled', manifest.file));
  if (binary.length !== manifest.bytes || createHash('sha256').update(binary).digest('hex') !== manifest.sha256) {
    throw new Error('Compiled model is incomplete or corrupt. Rebuild Browser models.');
  }
  return manifest;
}

export async function inventory(directory, include = () => true) {
  const files = [];
  async function visit(folder, prefix = '') {
    for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error('Game assets must not contain symlinks: ' + relative);
      if (entry.isDirectory()) await visit(join(folder, entry.name), relative + '/');
      else if (entry.isFile() && include(relative)) {
        const data = await readFile(join(folder, entry.name));
        files.push({ path: relative, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
      }
    }
  }
  await visit(directory);
  return files;
}

export async function prepareWeb() {
  const sourceHash = await modelSourceHash();
  const manifest = await validateCompiled(webSource, sourceHash);
  const files = await inventory(webSource, name =>
    !name.startsWith('compiled/') || ['compiled/manifest.json', 'compiled/' + manifest.file].includes(name));
  // Only this generated staging directory is replaced. Browser/dist is never edited.
  if (resolve(webTarget) !== resolve(desktop, 'web')) throw new Error('Unsafe staging directory');
  await rm(webTarget, { recursive: true, force: true });
  for (const file of files) {
    const target = join(webTarget, file.path);
    await mkdir(dirname(target), { recursive: true });
    // Copy bytes only; source artwork can carry read-only Windows attributes.
    await writeFile(target, await readFile(join(webSource, file.path)));
  }
  if (JSON.stringify(await inventory(webTarget)) !== JSON.stringify(files) || await modelSourceHash() !== sourceHash) {
    throw new Error('Game files changed during packaging. Retry after edits finish.');
  }
  await mkdir(join(desktop, 'out'), { recursive: true });
  await writeFile(join(desktop, 'out/web-build.json'), JSON.stringify({ sourceHash, files }, null, 2) + '\n');
  console.log(`Staged ${files.length} unchanged web assets; one current compiled model.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareWeb();
