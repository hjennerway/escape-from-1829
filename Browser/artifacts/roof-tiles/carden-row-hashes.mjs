import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {cardenHeightSnapshot} from '../annexe-carden-height-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const path=new URL('../../../Research/carden-picton/height-extension-before.json',import.meta.url);
const original=readFileSync(path,'utf8'),before=JSON.parse(original),{annexe}=createEscapeExterior(THREE,1.5);
const after=cardenHeightSnapshot(THREE,annexe),tiledNames=new Set(),edits=[];
annexe.traverse(o=>{if(o.material?.userData.roofTilePixels)tiledNames.add(o.name);});
assert.equal(before.towerRows.length,after.towerRows.length);
for(const row of before.towerRows){
 const matrix=row[3].map((v,i)=>[1,5,9,13].includes(i)?v*.85:v);
 const matches=after.towerRows.filter(candidate=>candidate[0]===row[0]&&
  JSON.stringify(candidate[2])===JSON.stringify(row[2])&&JSON.stringify(candidate.slice(4))===JSON.stringify(row.slice(4))&&
  candidate[3].every((v,i)=>Math.abs(v-matrix[i])<6e-6));
 assert(matches.length,'Every tower primitive must retain its materials, flags and original height correction');
 if(matches.some(candidate=>candidate[1]===row[1]))continue;
 assert(tiledNames.has(row[0]),'Only tiled roof hashes may change: '+row[0]);
 const hashes=new Set(matches.map(candidate=>candidate[1]));assert.equal(hashes.size,1);
 const lines=original.split(/\r?\n/),line=lines.findIndex(value=>value.trim()===JSON.stringify(row[0])+',');
 assert.equal(lines[line+1].trim(),JSON.stringify(row[1])+',');
 edits.push({context:lines[line],old:lines[line+1],next:lines[line+1].replace(row[1],[...hashes][0])});
}
writeFileSync(new URL('carden-row-proposal.json',import.meta.url),JSON.stringify(edits,null,2)+'\n');
console.log(JSON.stringify(edits));
