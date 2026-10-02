import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const manifest=JSON.parse(readFileSync(new URL('../../dist/compiled/manifest.json',import.meta.url)));
const current=await modelSourceHash(),report={compiled:manifest.sourceHash,current,matches:manifest.sourceHash===current,file:manifest.file};
writeFileSync(new URL('compiled-source-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
assert(report.matches,'Compiled estate matches the current model sources');
console.log('PASS: compiled estate source fingerprint is current.');
