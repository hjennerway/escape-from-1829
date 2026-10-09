import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../../',import.meta.url),seen=new Set();
async function visit(url){
 if(seen.has(url.href))return;seen.add(url.href);
 const source=await readFile(url,'utf8');
 for(const match of source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)['"](\.[^'"]+)['"]/g))await visit(new URL(match[1],url));
}
await visit(new URL('test-jarman.mjs',root));
const changed=['dist/escape-tower.mjs','dist/escape-tower-plan.mjs'];
const dependencies=[...seen].map(url=>fileURLToPath(url));
const changedRuntimeDependencies=changed.filter(path=>seen.has(new URL(path,root).href));
assert.deepEqual(changedRuntimeDependencies,[],'Jarman snapshot check must not depend on this task’s runtime changes');
const result={test:'test-jarman.mjs',changedRuntimeDependencies,dependencies:dependencies.sort(),
 conclusion:'The failing Jarman estate snapshot does not import either changed tower runtime module.'};
await writeFile(new URL('jarman-dependencies.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(result.conclusion+' Audited '+seen.size+' modules.');
