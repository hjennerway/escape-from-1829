import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const out=new URL('./',import.meta.url),manifest=JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url),'utf8'));
const current=await modelSourceHash();assert.equal(manifest.sourceHash,current,'Compiled model must match the final source');
const bytes=await readFile(new URL('../../dist/compiled/'+manifest.file,import.meta.url)),hash=createHash('sha256').update(bytes).digest('hex');assert.equal(hash,manifest.sha256);
const source=JSON.parse(await readFile(new URL('final-source-validation.json',out),'utf8')),compiled=JSON.parse(await readFile(new URL('final-compiled-validation.json',out),'utf8'));
assert.equal(compiled.modelMode.mode,'compiled');assert.equal(source.probes.length,32);assert.equal(compiled.probes.length,32);
for(let i=0;i<32;i++){
 if(source.probes[i].point)for(let j=0;j<3;j++)assert(Math.abs(source.probes[i].point[j]-compiled.probes[i].point[j])<.000001);
 else for(let j=0;j<2;j++)assert(Math.abs(source.probes[i].heights[j]-compiled.probes[i].heights[j])<.000001);
}
assert.equal(source.gutter.corniceSamples,65);assert.equal(compiled.gutter.corniceSamples,65);assert.equal(source.gutter.contacts.length,19);assert.equal(compiled.gutter.contacts.length,19);
for(let i=0;i<19;i++)for(let j=0;j<3;j++)assert(Math.abs(source.gutter.contacts[i][j]-compiled.gutter.contacts[i][j])<.000001);
await writeFile(new URL('final-model.json',out),JSON.stringify({manifest,verifiedSourceHash:current,verifiedBinaryHash:hash,visibleContactsAndSeams:32,clearCorniceSamples:65,gutterContacts:19,sourceCompiledProbeMatch:true},null,2)+'\n');
console.log('PASS: current source fingerprint, compiled asset checksum and all 32 source/compiled local roof probes match.');

