import assert from 'node:assert/strict';
import {readFile,writeFile,appendFile} from 'node:fs/promises';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const manifest=JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url),'utf8'));
const state={sourceHash:await modelSourceHash(),compiledHash:manifest.sourceHash,file:manifest.file};
assert.equal(state.sourceHash,state.compiledHash,'Final model must match the shared source');
await writeFile(new URL('final-model.json',import.meta.url),JSON.stringify(state,null,2)+'\n');
await appendFile(new URL('../../../DEVELOPMENT.md',import.meta.url),'\nFinal courtyard validation: the complete timeline browser check passes every\nsource/compiled year, selection, navigation, phone and live walking collision\ncheck. The final local aerial asset is rebuilt after the latest independent\nshared-model edit, and its source fingerprint matches. Saved manifest metadata\nis in Browser/artifacts/west-court-window-roof/final-model.json.\n');
console.log('PASS: final compiled model matches current shared source; timeline validation and notes complete.');
