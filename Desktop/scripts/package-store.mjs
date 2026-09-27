import { access, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { desktop } from './prepare-web.mjs';
import { packageWindows } from './package-windows.mjs';
import { createManifest, previewIdentity, validateIdentity } from './store-manifest.mjs';

async function findMakeAppx() {
  if (process.env.MAKEAPPX_PATH) { await access(process.env.MAKEAPPX_PATH); return process.env.MAKEAPPX_PATH; }
  const bases = [
    join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Windows Kits/10/bin'),
    join(desktop, '.cache/windows-sdk/bin'),
  ];
  for (const base of bases) {
    const versions = await readdir(base).catch(() => []);
    for (const version of versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))) {
      const candidate = join(base, version, 'x64/makeappx.exe');
      try { await access(candidate); return candidate; } catch {}
    }
  }
  throw new Error('Windows SDK MakeAppx.exe not found. Install Windows SDK, set MAKEAPPX_PATH, or run Desktop/scripts/setup-sdk.ps1.');
}

const preview = process.argv.includes('--preview');
if (process.platform !== 'win32') throw new Error('MSIX packaging requires Windows.');
let identity;
if (preview) identity = previewIdentity;
else if (process.env.STORE_IDENTITY_NAME || process.env.STORE_PUBLISHER || process.env.STORE_PUBLISHER_DISPLAY_NAME) {
  identity = { identityName: process.env.STORE_IDENTITY_NAME, publisher: process.env.STORE_PUBLISHER, publisherDisplayName: process.env.STORE_PUBLISHER_DISPLAY_NAME };
} else {
  try { identity = JSON.parse(await readFile(resolve(desktop, 'store-identity.local.json'), 'utf8')); }
  catch { throw new Error('Reserve the game in Partner Center, then copy store-identity.example.json to store-identity.local.json and fill its three fields. Use package:preview for local testing.'); }
}
validateIdentity(identity, { preview });
const makeappx = await findMakeAppx();
const directory = await packageWindows();
const metadata = JSON.parse(await readFile(join(desktop, 'package.json'), 'utf8'));
await mkdir(join(directory, 'Assets'), { recursive: true });
for (const name of ['StoreLogo', 'Square44x44Logo', 'Square150x150Logo', 'Wide310x150Logo']) {
  await cp(join(desktop, 'assets', name + '.png'), join(directory, 'Assets', name + '.png'));
}
await writeFile(join(directory, 'AppxManifest.xml'), createManifest(identity, metadata.version, { preview }));
const output = join(desktop, 'out', `EscapeFrom1829-${metadata.version}-x64-${preview ? 'preview-unsigned' : 'store'}.msix`);
await new Promise((resolve, reject) => {
  // Keep MakeAppx semantic validation enabled. Never install or sign a certificate here.
  const child = spawn(makeappx, ['pack', '/d', directory, '/p', output, '/o'], { windowsHide: true, stdio: 'inherit' });
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve() : reject(new Error(`MakeAppx exited with ${code}`)));
});
console.log(`Created ${output}`);
console.log(preview
  ? 'Unsigned development package, not for Store submission. Run the unpacked EscapeFrom1829.exe for local testing.'
  : 'Unsigned Store submission package. Microsoft signs it after certification. Upload through Partner Center; this script does not publish.');
