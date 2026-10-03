import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const architecture=new URL('../../dist/asylum-architecture.mjs',import.meta.url);
const test=new URL('../../test-asylum-stairs.mjs',import.meta.url);
const rebase=(source,base)=>source.replace(/from '(\.[^']+)'/g,(_,path)=>`from '${new URL(path,base).href}'`);
const baseline=new URL('architecture-baseline.mjs',import.meta.url),runner=new URL('original-regression.mjs',import.meta.url);
await writeFile(baseline,rebase(await readFile(new URL('asylum-architecture-before.mjs',import.meta.url),'utf8'),architecture));
const source=rebase(await readFile(test,'utf8'),test)
 .replace(architecture.href,baseline.href)
 .replace("new URL('./dist/asylum-plan.json',import.meta.url)",`new URL('${new URL('../../dist/asylum-plan.json',import.meta.url).href}')`);
await writeFile(runner,source);
let failure='';
try{execFileSync(process.execPath,[fileURLToPath(runner)],{encoding:'utf8',stdio:'pipe'});}
catch(error){failure=error.stderr??'';}
assert.match(failure,/planar concrete underside/,'The original tread blocks must fail the new underside regression');
await writeFile(new URL('original-rejection.log',import.meta.url),failure);
console.log('PASS: the saved original stair model fails the first planar-underside sample.');
