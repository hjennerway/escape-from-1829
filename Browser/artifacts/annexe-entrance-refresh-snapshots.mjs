import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const run=args=>JSON.parse(execFileSync(process.execPath,args,{encoding:'utf8',windowsHide:true}));
const before=run(['--import','./Browser/artifacts/annexe-entrance-before-loader.mjs','Browser/artifacts/annexe-entrance-tree-scope.mjs']);
const after=run(['Browser/artifacts/annexe-entrance-tree-scope.mjs']);
assert.deepEqual(before.withoutMarkedTree,after.original,'Every other estate primitive and tree crown remains exact');
const report={before,after,updated:[]};
for(const [name,path,key] of [['jarman','Research/jarman/protected-geometry.json',null],['leighton','Research/leighton-newton/protected-before.json','geometry']]){
 const saved=JSON.parse(readFileSync(path));assert.deepEqual(key?saved[key]:saved,before.original[name],'Only refresh a baseline matching the original tree');
 assert.equal((before.original[name].primitives??before.original[name].count)-(after.original[name].primitives??after.original[name].count),6);
 if(key)saved[key]=after.original[name];writeFileSync(path,JSON.stringify(key?saved:after.original[name],null,2)+'\n');report.updated.push(path);
}
writeFileSync('Browser/artifacts/annexe-entrance-tree-preservation.json',JSON.stringify(report,null,2)+'\n');console.log(report.updated);
