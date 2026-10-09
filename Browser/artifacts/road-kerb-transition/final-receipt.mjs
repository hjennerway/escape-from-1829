import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const json=async file=>JSON.parse(await readFile(new URL(file,import.meta.url),'utf8'));
const manifest=await json('../../dist/compiled/manifest.json'),capture=await json('compiled.json');
assert.equal(manifest.sourceHash,await modelSourceHash());
assert.equal(capture.build.mode,'compiled');assert.equal(capture.manifest.file,manifest.file);
assert.deepEqual(capture.errors,[]);
const roadPreservation=await json('road-preservation.json');
assert(roadPreservation.roadBuffersUnchanged&&roadPreservation.originalGhostRejected);
for(const [file,marker] of [['pavements-final.log','PASS: historic, shared, joined and parking kerbs'],['precompiled-final.log','PASS: compiled estate']]){
 assert((await readFile(new URL(file,import.meta.url),'utf8')).includes(marker),file);
}
const receipt={manifest,roadPreservation,views:capture.views.map(v=>v.name),pageErrors:capture.errors,
 renderer:'ANGLE / NVIDIA GeForce RTX 3090 Ti / Direct3D11',pavementsPassed:true,sourceCompiledComparisonPassed:true};
await writeFile(new URL('validation.json',import.meta.url),JSON.stringify(receipt,null,2)+'\n');
console.log('PASS: final source fingerprint, compiled captures, unchanged road buffers and validation receipts.');
