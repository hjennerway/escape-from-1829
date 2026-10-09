import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const before=JSON.parse(await readFile(new URL('before-audit.json',import.meta.url),'utf8'));
assert.equal(before.overlapSamples,444);
const probes=before.overlaps.map(({point,normal,authored,authoredHits})=>({point,normal,authored,authoredHits}));
await writeFile(new URL('../../test-support/roof-wall-flicker-rays.json',import.meta.url),'[\n'+probes.map(p=>' '+JSON.stringify(p)).join(',\n')+'\n]\n');
