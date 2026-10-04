import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {buildAsylumLayout} from '../../dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from '../../dist/asylum-architecture.mjs';

// Retain all pre-existing doorway/stair work in the shared checkout. Only
// remove this task's finish attributes and rail mesh from the comparison.
const sourceUrl=new URL('../../dist/asylum-architecture.mjs',import.meta.url);
let before=await readFile(sourceUrl,'utf8');
before=before.replace('const roomMaterials=asylumRoomWallMaterials(THREE,cache.get(THREE));','const roomMaterials=cache.get(THREE);');
before=before.replace("kind==='Stone'?merged:roomFinisher.geometry(merged)",'merged');
before=before.replace(/ const dado=new THREE.Mesh\(roomFinisher.rail\(\),materials.Dado\);dado.name='Asylum Dado';scene.add\(dado\);/,'');
before=before.replace(/from\s*(['"])(\.[^'"]+)\1/g,(_,quote,path)=>`from ${quote}${new URL(path,sourceUrl).href}${quote}`);
const original=await import('data:text/javascript;base64,'+Buffer.from(before).toString('base64'));
const plan=JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
const stats=scene=>{
 let triangles=0;for(const m of scene.children)if(m.geometry)triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3*(m.isInstancedMesh?m.count:1);
 return {draws:scene.children.filter(m=>m.isMesh).length,triangles};
};
const comparison=floors.map(floor=>{
 const baseline=new THREE.Scene(),current=new THREE.Scene();original.buildAsylumArchitecture(THREE,baseline,floor);buildAsylumArchitecture(THREE,current,floor);
 const a=stats(baseline),b=stats(current);
 return {floor:floor.id,baseline:a,current:b,addedDraws:b.draws-a.draws,addedTriangles:b.triangles-a.triangles};
});
await writeFile(new URL('geometry-comparison.json',import.meta.url),JSON.stringify(comparison,null,2)+'\n');console.log(JSON.stringify(comparison));
