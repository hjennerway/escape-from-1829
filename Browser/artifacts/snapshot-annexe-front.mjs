import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
const {createEscapeExterior}=await import(process.argv.includes('--baseline')?'./escape-exterior-baseline.mjs':'../dist/escape-exterior.mjs');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {annexe}=createEscapeExterior(THREE,1.5);annexe.updateMatrixWorld(true);
const records=[],instance=new THREE.Matrix4(),world=new THREE.Matrix4();
const inverse=annexe.matrixWorld.clone().invert();
const protectedName=name=>/^(Central hall|Entrance |Hall dormer|West front pavilion|East front pavilion|West square tower|East square tower|West pavilion|East pavilion|West tower|East tower|Tower |Portal |Bell|Belfry |Visible hanging bell|Weather vane)/.test(name);
annexe.traverse(o=>{
 if(!o.isMesh)return;
 let side=false;for(let p=o.parent;p&&p!==annexe;p=p.parent)if(/mirrored side details/.test(p.name))side=true;
 const rootInstances=o.isInstancedMesh&&o.parent===annexe;
 if(!protectedName(o.name)&&!side&&!rootInstances)return;
 const hash=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 const geometry=hash.digest('hex');
 const record=m=>records.push(JSON.stringify([geometry,o.material.color?.getHex(),new THREE.Matrix4().multiplyMatrices(inverse,m).elements.map(n=>+n.toFixed(6))]));
 if(rootInstances){for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);const p=new THREE.Vector3().setFromMatrixPosition(instance);if(Math.abs(p.x)<32&&p.z>=-19&&(Math.abs(p.x)>11||p.z>=-8))record(world.multiplyMatrices(o.matrixWorld,instance));}}
 else record(o.matrixWorld);
});
const snapshot={count:records.length,digest:createHash('sha256').update(records.sort().join('\n')).digest('hex')};
const path=new URL('../../Research/annexe-photo-placement/protected-front-local.json',import.meta.url);
if(process.argv.includes('--save'))writeFileSync(path,JSON.stringify(snapshot,null,2)+'\n');else assert.deepEqual(snapshot,JSON.parse(readFileSync(path)),'Blue-circled front retains its local geometry within the uniform site fit');
console.log(snapshot);
