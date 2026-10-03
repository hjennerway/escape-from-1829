import {readFile,writeFile} from 'node:fs/promises';
const dist=new URL('../../dist/',import.meta.url),sources=new Set();
async function visit(url){
 if(sources.has(url.href))return;sources.add(url.href);
 for(const match of (await readFile(url,'utf8')).matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)['"](\.[^'"]+)['"]/g))await visit(new URL(match[1],url));
}
await visit(new URL('aerial-scene.mjs',dist));
const affected=['asylum-layout.mjs','asylum-plan.json','floors.mjs'],result={inputs:sources.size,affectedIncluded:affected.filter(f=>sources.has(new URL(f,dist).href))};
await writeFile(new URL('model-inputs.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(result);
