import { packager } from '@electron/packager';
import { flipFuses, FuseVersion, FuseV1Options } from '@electron/fuses';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { desktop, prepareWeb } from './prepare-web.mjs';
import { createAssets } from './create-assets.mjs';
import { retryElectronDownload } from './retry-electron-download.mjs';

export const executableName = 'EscapeFrom1829';
export const packagedDirectory = join(desktop, 'out', executableName + '-win32-x64');

export async function packageWindows() {
  if (process.platform !== 'win32') throw new Error('Build the Windows release on Windows (or use the Windows GitHub workflow).');
  await prepareWeb();
  await createAssets();
  const metadata = JSON.parse(await readFile(join(desktop, 'package.json'), 'utf8'));
  // Use the pinned npm dependency's checksums, as Electron's installer does.
  // This also avoids fetching SHASUMS256.txt to validate an already-cached ZIP.
  const require = createRequire(import.meta.url);
  const checksums = require('electron/checksums.json');
  await mkdir(join(desktop, '.cache'), { recursive: true });
  const staging = await mkdtemp(join(desktop, '.cache/app-'));
  try {
    await cp(join(desktop, 'app'), join(staging, 'app'), { recursive: true });
    await cp(join(desktop, 'web'), join(staging, 'web'), { recursive: true });
    await writeFile(join(staging, 'package.json'), JSON.stringify({
      name: metadata.name, version: metadata.version, description: metadata.description, main: metadata.main, author: metadata.author,
    }, null, 2));
    const output = await retryElectronDownload(() => packager({
      dir: staging, out: join(desktop, 'out'), name: executableName, executableName,
      platform: 'win32', arch: 'x64', electronVersion: metadata.devDependencies.electron,
      download: { cacheRoot: process.env.electron_config_cache, checksums },
      appVersion: metadata.version, buildVersion: metadata.version + '.0',
      asar: true, overwrite: true, prune: false, icon: join(desktop, 'assets/game.ico'),
      win32metadata: { ProductName: 'Escape from 1829', FileDescription: 'Escape from 1829' },
    }));
    await flipFuses(join(output[0], executableName + '.exe'), {
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    });
    console.log('Windows game: ' + join(output[0], executableName + '.exe'));
    return output[0];
  } finally {
    if (!resolve(staging).startsWith(resolve(desktop, '.cache') + '\\')) throw new Error('Unsafe staging cleanup');
    await rm(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await packageWindows();
