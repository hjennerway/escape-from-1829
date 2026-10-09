import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { contentPath, externalURL, isGameURL } from '../app/content.cjs';
import { createManifest, previewIdentity, storeVersion, validateIdentity } from '../scripts/store-manifest.mjs';
import { validateCompiled, validateInteriorCompiled } from '../scripts/prepare-web.mjs';

test('only packaged game paths can be served; queries and nested assets work', () => {
  const root = join(tmpdir(), 'escape-test-web');
  assert.equal(contentPath(root, 'escape1829://game/'), join(root, 'index.html'));
  assert.equal(contentPath(root, 'escape1829://game/exterior/front.webp?v=3'), join(root, 'exterior/front.webp'));
  for (const value of ['https://game/index.html', 'escape1829://other/a', 'escape1829://user@game/a',
    'escape1829://game/%2e%2e%2fsecret', 'escape1829://game/C:%5csecret', 'escape1829://game/a%00',
    'escape1829://game/a%5c..%5csecret', 'escape1829://game/bad%']) {
    assert.throws(() => contentPath(root, value), value);
  }
  assert.equal(isGameURL('escape1829://game.evil/a'), false);
  assert.equal(externalURL('https://github.com/hjennerway/escape-from-1829'), 'https://github.com/hjennerway/escape-from-1829');
  for (const value of ['file:///C:/Windows', 'javascript:alert(1)', 'ms-settings:foo', 'https://user:password@example.com']) assert.equal(externalURL(value), null);
});

test('Store identity is required and preview identity never passes as a Store release', () => {
  assert.throws(() => validateIdentity({}));
  assert.throws(() => validateIdentity(previewIdentity));
  assert.throws(() => validateIdentity({ ...previewIdentity, identityName: 'COPY_PACKAGE_IDENTITY_NAME' }, { preview: true }));
  const identity = { identityName: '12345.ExampleGame', publisher: 'CN=11111111-2222-3333-4444-555555555555', publisherDisplayName: 'A & B <Games>' };
  const manifest = createManifest(identity, '1.2.3');
  assert.match(manifest, /Version="1\.2\.3\.0"/);
  assert.match(manifest, /A &amp; B &lt;Games&gt;/);
  assert.match(manifest, /Windows.Desktop/);
  assert.match(manifest, /runFullTrust/);
  assert.match(createManifest(previewIdentity, '1.0.0', { preview: true }), /LocalPreview/);
  for (const version of ['0.0.0', '1.0.0-beta', '1.0', '1.0.0.1', '1.65536.0']) assert.throws(() => storeVersion(version));
});

test('packaging rejects stale, missing and corrupt compiled assets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'escape-compiled-test-'));
  try {
    await mkdir(join(root, 'compiled'));
    const data = Buffer.from('compressed model fixture');
    const manifest = { sourceHash: 'source-hash', file: 'aerial-abcd.bin.gz', bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') };
    await writeFile(join(root, 'compiled/manifest.json'), JSON.stringify(manifest));
    await assert.rejects(validateCompiled(root, 'source-hash'));
    await writeFile(join(root, 'compiled', manifest.file), data);
    assert.deepEqual(await validateCompiled(root, 'source-hash'), manifest);
    await assert.rejects(validateCompiled(root, 'new-source-hash'), /stale/);
    await writeFile(join(root, 'compiled', manifest.file), 'corrupt');
    await assert.rejects(validateCompiled(root, 'source-hash'), /corrupt/);
    await writeFile(join(root, 'compiled/manifest.json'), JSON.stringify({ ...manifest, file: '../../secret' }));
    await assert.rejects(validateCompiled(root, 'source-hash'), /filename/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('packaging requires current, intact interior sections and their shared floor resources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'escape-interior-package-test-'));
  const directory = join(root, 'compiled/interior');
  const data = Buffer.from('interior model fixture');
  const sha256 = createHash('sha256').update(data).digest('hex');
  const resource = { floor: 0, file: `floor-0-${sha256.slice(0, 16)}.bin.gz`, bytes: data.length, sha256 };
  const section = { ...resource, file: `0-west-${sha256.slice(0, 16)}.bin.gz` };
  const manifest = { format: 1, sourceHash: 'interior-hash', resources: { 0: resource }, sections: [section] };
  const saveManifest = value => writeFile(join(directory, 'manifest.json'), JSON.stringify(value));
  try {
    await mkdir(directory, { recursive: true });
    await assert.rejects(validateInteriorCompiled(root, 'interior-hash'), /ENOENT/);
    await saveManifest(manifest);
    await assert.rejects(validateInteriorCompiled(root, 'interior-hash'), /ENOENT/);
    await writeFile(join(directory, resource.file), data);
    await assert.rejects(validateInteriorCompiled(root, 'interior-hash'), /ENOENT/);
    await writeFile(join(directory, section.file), data);
    assert.deepEqual(await validateInteriorCompiled(root, 'interior-hash'), manifest);
    await assert.rejects(validateInteriorCompiled(root, 'new-interior-hash'), /stale/);
    for (const asset of [resource, section]) {
      await writeFile(join(directory, asset.file), Buffer.alloc(data.length));
      await assert.rejects(validateInteriorCompiled(root, 'interior-hash'), /corrupt/);
      await writeFile(join(directory, asset.file), data.subarray(1));
      await assert.rejects(validateInteriorCompiled(root, 'interior-hash'), /corrupt/);
      await writeFile(join(directory, asset.file), data);
    }
    for (const invalid of [{ ...manifest, format: 999 }, { ...manifest, sections: [] }, { ...manifest, resources: {} }]) {
      await saveManifest(invalid);
      await assert.rejects(validateInteriorCompiled(root, 'interior-hash'), /incomplete or incompatible/);
    }
    await saveManifest({ ...manifest, sections: [{ ...section, file: '../../secret' }] });
    await assert.rejects(validateInteriorCompiled(root, 'interior-hash'), /filename/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
