import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from '../../dist/aerial-performance.mjs';
import {createAsylumOutside} from '../../dist/asylum-outside.mjs';
import {createEscapeGrounds} from '../../dist/escape-grounds.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const resolve=source=>source.replace(/from '(\.\/[^']+)'/g,(_,path)=>'from '+JSON.stringify(new URL('../../dist/'+path.slice(2),import.meta.url).href));
const inline=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const workshop=inline(resolve((await readFile(new URL('../../dist/tower-workshops.mjs',import.meta.url),'utf8')).replace('westShift=-.9','westShift=0')));
const grounds=resolve((await readFile(new URL('../../dist/escape-grounds.mjs',import.meta.url),'utf8')).replace("from './tower-workshops.mjs'",'from '+JSON.stringify(workshop)));
const baseline=(await import(inline(grounds))).createEscapeGrounds;
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);batchAerialMeshes(THREE,exterior.model);cacheAerialTransforms(exterior.scene);
const walker=createAsylumOutside(THREE,exterior),samples=[];
for(const [label,create] of [['unshifted',baseline],['shifted',createEscapeGrounds]]){
 const world=create(THREE,exterior,walker,{run:{},recordGrounds(){}}),meshes=[];exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 const ray=new THREE.Raycaster(new THREE.Vector3(156.3,.15,-59.5),new THREE.Vector3(-1,0,0),0,10),hit=ray.intersectObjects(meshes,false)[0],sources=[];
 world.workshops.group.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch)sources.push(o);});
 const sourceHits=ray.intersectObjects(sources,false).slice(0,6).map(h=>({name:h.object.name,x:h.point.x,material:h.object.material.name}));
 samples.push({label,westX:world.workshops.plan.westX,hitX:hit.point.x,hitZ:hit.point.z,name:hit.object.name,sourceHits});world.dispose();
}
assert.equal(samples[0].hitX,samples[1].hitX,'The pre-existing tower sightline obstruction is independent of the west wall move');
const gateSamples=[];
for(const [label,create] of [['unshifted',baseline],['shifted',createEscapeGrounds]]){
 const model=new THREE.Group(),estate={model,invalidateShadows(){}},navigation=createAsylumOutside(THREE,estate),world=create(THREE,estate,navigation,{run:{},recordGrounds(){}}),gate=world.nodes.find(n=>n.id==='pedestrian');
 world.use(gate);gateSamples.push({label,openedGateClear:navigation.clear(gate.x,gate.z)});world.dispose();
}
assert.equal(gateSamples[0].openedGateClear,gateSamples[1].openedGateClear,'Full-suite gate result is independent of the wall shift');
await writeFile(new URL('baseline-sightline.json',import.meta.url),JSON.stringify({samples,gateSamples},null,2));console.log(JSON.stringify({samples,gateSamples},null,2));
