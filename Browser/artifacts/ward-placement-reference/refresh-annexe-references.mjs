// Advance only hashes proven to differ solely because of approved pipe moves.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const audit=JSON.parse(readFileSync(new URL('snapshot-mismatch-audit.json',import.meta.url)));
const pipes=JSON.parse(readFileSync(new URL('pipe-primitive-audit.json',import.meta.url)));
assert.equal(await modelSourceHash(),pipes.sourceHash,'Audited modelling sources remain unchanged');
const cases=[
 ['test-larkton.mjs',0,'larkton-jodrell/protected-before.json',[]],
 ['test-larkton-recess.mjs',0,'larkton-jodrell/recess-protected-before.json',['outside']],
 ['test-larkton-recess.mjs',1,'larkton-jodrell/recess-protected-before.json',['retained']],
 ['test-annexe-carden.mjs',0,'carden-picton/outward-protected-geometry.json',[]],
 ['test-annexe-carden.mjs',1,'carden-picton/height-extension-before.json',['protected']],
 ['test-annexe-front-link.mjs',0,'annexe-frontage-adjustment/front-link-before.json',['sha256']],
 ['test-annexe-kitchen.mjs',0,'annexe-kitchen/protected-geometry.json',[]],
 ['test-annexe-rear-stretch.mjs',0,'annexe-kitchen/rear-stretch-before.json',['front']],
 ['test-annexe-rear-side-alignment.mjs',0,'annexe-kitchen/side-alignment-before.json',['snapshot']],
 ['test-annexe-os-refinement.mjs',0,'annexe-photo-placement/approved-shape.json',[]],
 ['test-oakmere-court.mjs',0,'oakmere/court-protected-before.json',[]],
 ['test-oakmere-west.mjs',0,'oakmere/west-protected-geometry.json',[]],
 ['test-oakmere-windows.mjs',0,'oakmere/window-protected-geometry.json',[]],
 ['test-annexe-access.mjs',0,'annexe-frontage-adjustment/entrance-alignment-before.json',['protectedGeometry']]
];
const files=new Map(),changes=[];
function hashesOnly(old,value,path=[]){
 if(typeof old==='object'&&old!==null){assert.deepEqual(Object.keys(old),Object.keys(value));for(const key of Object.keys(old))hashesOnly(old[key],value[key],[...path,key]);}
 else if(['sha256','digest','hash'].includes(path.at(-1))){assert.match(value,/^[a-f0-9]{64}$/);}
 else assert.deepEqual(value,old,'Counts, root, and non-hash fields remain exact');
}
for(const [test,index,name,keys] of cases){
 const oldRun=audit.find(r=>r.mode==='without-pipes'&&r.name===test),current=audit.find(r=>r.mode==='current'&&r.name===test);
 assert.equal(oldRun.code,0);assert.equal(oldRun.failures.length,0,'Original snapshot is reproduced with only pipe relocation disabled');assert.equal(current.code,0);
 const failure=current.failures[index],url=new URL('../../../Research/'+name,import.meta.url);
 const file=files.get(name)??JSON.parse(readFileSync(url));files.set(name,file);
 let parent=file;for(const key of keys.slice(0,-1))parent=parent[key];
 const saved=keys.length?parent[keys.at(-1)]:file;
 assert.deepEqual(saved,failure.expected,'Saved historical reference matches the audited assertion');
 if(typeof saved==='string')assert.match(failure.actual,/^[a-f0-9]{64}$/);else hashesOnly(saved,failure.actual);
 if(keys.length)parent[keys.at(-1)]=failure.actual;else Object.assign(file,failure.actual);
 changes.push({test,name,keys,before:failure.expected,after:failure.actual});
}
assert.equal(await modelSourceHash(),pipes.sourceHash);
if(process.argv.includes('--write'))for(const [name,file] of files)writeFileSync(new URL('../../../Research/'+name,import.meta.url),JSON.stringify(file,null,2)+'\n');
writeFileSync(new URL('annexe-reference-refresh.json',import.meta.url),JSON.stringify({sourceHash:pipes.sourceHash,changes},null,2)+'\n');
console.log('PASS:',files.size,'annexe reference files;',changes.length,'fingerprints. Counts, ranges and placement are retained.');
