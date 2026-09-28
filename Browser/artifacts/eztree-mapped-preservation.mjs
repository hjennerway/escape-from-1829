import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../dist/vendor/three.module.js';
import {addBeechTrees} from '../dist/front-lawn-trees.mjs';
let source=execFileSync('git',['show','HEAD:Browser/dist/front-lawn-trees.mjs'],{encoding:'utf8',windowsHide:true});
source=source.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL('../dist/'+p.slice(2),import.meta.url).href}'`);
const old=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function fingerprint(build){
  const group=new THREE.Group();build(THREE,group);const hashes={};
  for(const tree of group.children.filter(t=>t.userData.beechTree?.species)){
    const hash=createHash('sha256');
    tree.traverse(o=>{
      hash.update(JSON.stringify([o.name,o.position.toArray(),o.quaternion.toArray(),o.scale.toArray(),o.userData]));
      if(o.isMesh){
        for(const a of [...Object.values(o.geometry.attributes),o.geometry.index,o.instanceMatrix,o.instanceColor])if(a)hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
        hash.update(JSON.stringify([o.count,o.material.color.getHex(),o.material.alphaTest,o.material.side]));
        if(o.material.map?.image.data)hash.update(o.material.map.image.data);
      }
    });hashes[tree.name]=hash.digest('hex');
  }return hashes;
}
const before=fingerprint(old.addBeechTrees),after=fingerprint(addBeechTrees);assert.deepEqual(after,before);
await writeFile(new URL('eztree-mapped-preservation.json',import.meta.url),JSON.stringify({before,after,exact:true},null,2)+'\n');
console.log('PASS: mapped beeches retain exact geometry, instance buffers, transforms, palettes, textures and metadata.');
