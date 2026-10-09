import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dist=new URL('../../Browser/dist/',import.meta.url);
// Include runtime scenery, furniture binaries and shader helpers as well as
// architecture: the aerial fingerprint alone cannot detect gameplay changes.
export async function portInputHashes(){
  const files=[];
  async function visit(directory){
    for(const entry of await readdir(new URL(directory,dist),{withFileTypes:true})){
      const name=directory+entry.name;
      if(entry.isDirectory()){if(name!=='compiled')await visit(name+'/');}
      else if(/\.(?:mjs|js)$/.test(name)||name==='asylum-plan.json'||name.startsWith('models/furniture/')&&/\.(?:json|gltf|bin|png)$/.test(name)||name.startsWith('art/')&&/\.(?:png|webp|jpg|jpeg)$/.test(name))files.push(name);
    }
  }
  await visit('');files.sort();
  return Object.fromEntries(await Promise.all(files.map(async name=>[name,createHash('sha256').update(await readFile(new URL(name,dist))).digest('hex')])));
}
