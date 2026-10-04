import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const browser=new URL('../../',import.meta.url),changed=new URL('dist/hall-furniture-models.mjs',browser);
async function graph(entry){
 const inputs=new Set();
 async function visit(url){
  if(inputs.has(url.href))return;inputs.add(url.href);
  const source=await readFile(url,'utf8');
  for(const match of source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)['"](\.[^'"]+)['"]/g))await visit(new URL(match[1],url));
 }
 await visit(new URL(entry,browser));return {entry,inputs:inputs.size,importsArtworkBuilder:inputs.has(changed.href)};
}
const aerial=await graph('dist/aerial-scene.mjs'),outsideTest=await graph('test-asylum-outside.mjs');
assert.equal(aerial.importsArtworkBuilder,false);assert.equal(outsideTest.importsArtworkBuilder,false);
const source=await readFile('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-82b8f64f-79a5-4e84-b16a-32d36bb00b78.png'),asset=await readFile(new URL('dist/art/cheshire-lunatic-asylum.png',browser));assert(source.equals(asset));
await writeFile(new URL('scope.json',import.meta.url),JSON.stringify({aerial,outsideTest,artwork:{exactUpload:true,bytes:asset.length,sha256:createHash('sha256').update(asset).digest('hex')}},null,2)+'\n');
console.log('PASS: artwork is byte-identical to the upload; the aerial compiler and failing outside-stair test exclude the edited builder.');
