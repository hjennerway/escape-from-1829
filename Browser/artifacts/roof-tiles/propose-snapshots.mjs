import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const out=new URL('./',import.meta.url),read=async url=>JSON.parse(await readFile(url,'utf8'));
assert.deepEqual(await read(new URL('after-layout-preservation.json',out)),await read(new URL('before-layout-preservation.json',out)),
 'Complete original/current scene audit must preserve every roof surface and all other geometry');
const baseline=await read(new URL('baseline-snapshot-tests.json',out));
assert.deepEqual(baseline.filter(r=>r.code!==0).map(r=>r.command).sort(),['node test-jarman.mjs','node test-leighton-newton.mjs'],
 'Only the two previously failing whole-estate snapshots may fail with the original roof sources');
const hashes=new Map(),isHash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
function hasHash(value){return isHash(value)||(value&&typeof value==='object'&&Object.values(value).some(hasHash));}
function strip(value){
 if(isHash(value))return '<hash>';
 if(Array.isArray(value))return value.map(strip);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,strip(v)]));
 return value;
}
function collect(before,after){
 if(isHash(before)&&isHash(after)&&before!==after){assert(!hashes.has(before)||hashes.get(before)===after);hashes.set(before,after);}
 else if(before&&typeof before==='object')for(const key of Object.keys(before))collect(before[key],after[key]);
}
for(const name of await readdir(new URL('snapshot-errors/',out))){
 const record=await read(new URL('snapshot-errors/'+name,out));
 if(/test-jarman\.mjs|test-leighton-newton\.mjs/.test(record.stack))continue;
 if(!hasHash(record.expected))continue;
 assert.deepEqual(strip(record.actual),strip(record.expected),'Snapshot counts, roots, dimensions and other non-hash fields must remain exact');
 collect(record.expected,record.actual);
}
const changes=[];
async function visit(url){
 for(const entry of await readdir(url,{withFileTypes:true})){
  const file=new URL(entry.name+(entry.isDirectory()?'/':''),url);
  if(entry.isDirectory()){await visit(file);continue;}
  if(!entry.name.endsWith('.json'))continue;
  if(file.pathname.includes('/exterior-stair-rails/'))continue;
  const original=await readFile(file,'utf8'),value=JSON.parse(original),replacements=[];
  function update(node){
   if(Array.isArray(node))return node.map(update);
   if(node&&typeof node==='object')return Object.fromEntries(Object.entries(node).map(([key,v])=>[key,update(v)]));
   if(hashes.has(node)){replacements.push({before:node,after:hashes.get(node)});return hashes.get(node);}
   return node;
  }
  const next=update(value);
  if(replacements.length)changes.push({url:file.href,path:decodeURIComponent(file.pathname).replace(/^\//,''),original,
   updated:JSON.stringify(next,null,2)+'\n',replacements});
 }
}
await visit(new URL('../../../Research/',out));
assert(changes.every(c=>!c.path.includes('/jarman/')&&!c.path.includes('/leighton-newton/')),'Existing failing whole-estate records are retained');
await writeFile(new URL('snapshot-proposal.json',out),JSON.stringify({sourceHash:await modelSourceHash(),changes},null,2)+'\n');
console.log(JSON.stringify(changes.map(({path,replacements})=>({path,hashes:replacements.length})),null,2));
