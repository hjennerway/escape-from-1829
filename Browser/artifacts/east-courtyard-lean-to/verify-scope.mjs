import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const before=JSON.parse(readFileSync(new URL('before-scope.json',import.meta.url)));
const after=JSON.parse(readFileSync(new URL('after-scope.json',import.meta.url)));
assert.deepEqual(after.outside,before.outside,'All geometry outside the lean-to and grit bin remains exact');
assert.deepEqual(after.existingRoofs,before.existingRoofs,'All existing slate roofs remain exact');
writeFileSync(new URL('preservation.json',import.meta.url),JSON.stringify({passed:true,before,after},null,2)+'\n');
console.log('PASS: '+after.outside.count+' outside primitives and all slate roofs unchanged.');
