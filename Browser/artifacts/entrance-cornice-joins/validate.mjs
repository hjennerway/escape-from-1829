import {spawnSync} from 'node:child_process';
import {writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../../../',import.meta.url),results=[];
for(const [name,args,expected] of [
 ['original-roof',['--import','./Browser/artifacts/entrance-cornice-joins/baseline.mjs','Browser/test-east-entrance-roof-boundary.mjs'],/Slate meets the front cornice cap/],
 ['original-return',['--import','./Browser/artifacts/entrance-cornice-joins/baseline.mjs','Browser/test-east-entrance-roof-boundary.mjs','--return-only'],/high cornice continues to the main fascia/],
 ['east-boundary',['Browser/test-east-entrance-roof-boundary.mjs']],
 ['west-boundary',['Browser/test-west-entrance-roof-boundary.mjs']],
 ['inside-corners',['Browser/test-front-inside-corners.mjs']]
]){
 const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true}),output=r.stdout+r.stderr;
 await writeFile(new URL(name+'.log',import.meta.url),output);
 if(expected){assert(r.status!==0&&expected.test(output),name+' must detect the saved defect');}
 else assert.equal(r.status,0,name+' failed: '+output);
 results.push({name,exitCode:r.status,expectedFailure:!!expected});
}
const rendered=JSON.parse(await readFile(new URL('verified-validation.json',import.meta.url),'utf8'));
assert.equal(rendered.probes.length,15);assert.deepEqual(rendered.errors,[]);
await writeFile(new URL('validation.json',import.meta.url),JSON.stringify({scope:'Local entrance/courtyard geometry only; no full suite or compiled-model rebuild',results,renderedProbes:rendered.probes.length,hardware:'NVIDIA GeForce RTX 3090 Ti / Direct3D11',exports:'Browser modelling sources only; compiled aerial, Unity, Blender and packaged exports not regenerated'},null,2)+'\n');
console.log('PASS: both saved defects detected; local east/west boundary and courtyard geometry checks pass; 15 actual browser surface probes match.');
