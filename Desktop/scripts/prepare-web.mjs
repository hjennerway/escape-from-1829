import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modelSourceHash, interiorSourceHash } from '../../Browser/model-build-inputs.mjs';

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

export async function validateInteriorCompiled(source, expectedSourceHash) {
  const directory = join(source, 'compiled/interior');
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
  if (manifest.sourceHash !== expectedSourceHash) throw new Error('Compiled interiors are stale. Run npm run build:models in Browser.');
  if (manifest.format !== 1 || !Array.isArray(manifest.sections) || !manifest.sections.length || !manifest.resources ||
    manifest.sections.some(section => !manifest.resources[section.floor])) {
    throw new Error('Compiled interior manifest is incomplete or incompatible. Rebuild Browser models.');
  }
  for (const asset of [...Object.values(manifest.resources), ...manifest.sections]) {
    if (!/^[a-z0-9-]+-[a-f0-9]{16}\.bin\.gz$/.test(asset.file)) throw new Error('Invalid compiled interior filename');
    const binary = await readFile(join(directory, asset.file));
    if (binary.length !== asset.bytes || createHash('sha256').update(binary).digest('hex') !== asset.sha256) {
      throw new Error('Compiled interior is incomplete or corrupt. Rebuild Browser models.');
    }
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
  const interiorHash = await interiorSourceHash();
  const manifest = await validateCompiled(webSource, sourceHash);
  const interior = await validateInteriorCompiled(webSource, interiorHash);
  const compiledFiles = new Set([
    'compiled/manifest.json', 'compiled/' + manifest.file, 'compiled/interior/manifest.json',
    ...[...Object.values(interior.resources), ...interior.sections].map(asset => 'compiled/interior/' + asset.file),
  ]);
  const files = await inventory(webSource, name =>
    !name.startsWith('compiled/') || compiledFiles.has(name));
  // Only this generated staging directory is replaced. Browser/dist is never edited.
  if (resolve(webTarget) !== resolve(desktop, 'web')) throw new Error('Unsafe staging directory');
  await rm(webTarget, { recursive: true, force: true });
  for (const file of files) {
    const target = join(webTarget, file.path);
    await mkdir(dirname(target), { recursive: true });
    // Copy bytes only; source artwork can carry read-only Windows attributes.
    await writeFile(target, await readFile(join(webSource, file.path)));
  }
  if (JSON.stringify(await inventory(webTarget)) !== JSON.stringify(files) ||
    await modelSourceHash() !== sourceHash || await interiorSourceHash() !== interiorHash) {
    throw new Error('Game files changed during packaging. Retry after edits finish.');
  }
  await mkdir(join(desktop, 'out'), { recursive: true });
  await writeFile(join(desktop, 'out/web-build.json'), JSON.stringify({ sourceHash, interiorHash, files }, null, 2) + '\n');
  console.log(`Staged ${files.length} unchanged web assets; current estate and ${interior.sections.length} interior sections.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareWeb();
