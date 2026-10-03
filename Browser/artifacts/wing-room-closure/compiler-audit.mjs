import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dist,modelSourceHash} from '../../model-build-inputs.mjs';
const sources=new Map();
async function visit(url){
 if(sources.has(url.href))return;
 const source=await readFile(url,'utf8');sources.set(url.href,source);
 for(const match of source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)['"](\.[^'"]+)['"]/g))await visit(new URL(match[1],url));
}
await visit(new URL('aerial-scene.mjs',dist));
const inputs=[...sources.keys()].map(url=>url.slice(dist.href.length));
assert(!inputs.includes('asylum-plan.json'));assert(!inputs.includes('asylum-layout.mjs'));
const sourceHash=await modelSourceHash(),manifest=JSON.parse(await readFile(new URL('compiled/manifest.json',dist)));
const report={inputs:inputs.length,interiorExcluded:true,sourceHash,compiledSourceHash:manifest.sourceHash,compiledMatches:sourceHash===manifest.sourceHash};
report.unrelatedTests={};
for(const name of ['test-jarman.mjs','test-leighton-newton.mjs']){
 sources.clear();await visit(new URL('../../'+name,import.meta.url));
 const files=[...sources.keys()],interiorInputs=files.some(url=>/asylum-(?:layout|plan|architecture)|\/floors\.mjs/.test(url))||[...sources.values()].some(source=>/asylum-plan\.json/.test(source));
 assert(!interiorInputs,'Exterior snapshot tests exclude the edited room inputs');
 report.unrelatedTests[name]={inputs:files.length,interiorInputs};
}
await writeFile(new URL('./compiler-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
