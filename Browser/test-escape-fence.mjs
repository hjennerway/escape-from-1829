import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {createEscapeGrounds} from './dist/escape-grounds.mjs';
import {outdoorPath} from './dist/escape-world.mjs';

const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);
batchAerialMeshes(THREE,exterior.model);cacheAerialTransforms(exterior.scene);
const walker=createAsylumOutside(THREE,exterior),originalWall=exterior.haleWard.getObjectByName('Hale ward two-storey walls'),originalGeometry=originalWall.geometry;
let samples=0;
for(let attempt=0;attempt<2;attempt++){
 const world=createEscapeGrounds(THREE,exterior,walker,{run:{},recordGrounds(){}});
 // A convex hull of the clipped concave ward used to omit 17 m of rail and
 // prevent walking across empty lawn. Compare the repair to rendered masonry.
 assert(walker.clearPermanent(105,-85,0)&&walker.clearPermanent(105,-85,2),'Hale western court remains open after corridor shell clipping');
 assert(walker.clear(105,-83.5),'Player can approach the extended rail across the visible lawn');
 const wallMeshes=[];exterior.haleWard.traverseVisible(o=>{if(o.isMesh)wallMeshes.push(o);});
 const wallHit=new THREE.Raycaster(new THREE.Vector3(90,2.8,-85),new THREE.Vector3(1,0,0),0,40).intersectObjects(wallMeshes,false)[0];
 assert(wallHit,'Visible ward wall anchors the north fence');
 const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),quaternion=new THREE.Quaternion();let railEnd=-Infinity;
 const fittings=world.group.getObjectByName('Escape iron fittings');
 for(let i=0;i<fittings.count;i++){
  fittings.getMatrixAt(i,matrix);matrix.decompose(position,quaternion,scale);
  if(Math.abs(position.z+85)<.001&&Math.abs(position.y-2.8)<.001&&position.x>87&&scale.x>1)railEnd=Math.max(railEnd,position.x+scale.x/2);
 }
 assert(railEnd>=wallHit.point.x-.01&&railEnd<wallHit.point.x+.41,'Railing meets visible wall: '+JSON.stringify({railEnd,wallX:wallHit.point.x}));
 assert(walker.clearPermanent(wallHit.point.x-.1,-85,0,0)&&!walker.clearPermanent(wallHit.point.x-.1,-85,0),'Fence fitting excludes player clearance padding');
 function audit(){for(let x=89;x<wallHit.point.x;x+=.1)for(const y of [0,1.69]){assert(!walker.clear(x,-85,y),'Extended rail blocks walking and jumping at '+x);samples++;}}
 audit();exterior.trees.visible=false;walker.refresh();audit();exterior.trees.visible=true;walker.refresh();
 for(const x of [99,105,110,114.5])for(const jump of [false,true]){
  walker.resetJump();const actor={x,z:-83.5,y:0,outside:true};if(jump)walker.jump(actor);
  for(let i=0;i<120;i++)walker.update(actor,0,-5/120,1/120);
  assert(actor.z>-85,'Walking/jumping cannot bypass the repaired rail: '+JSON.stringify({x,jump,actor}));
 }
 assert(outdoorPath(walker,{x:105,z:-83.5},{x:87,z:-83.5}).length,'Wicket approach remains reachable along the lawn');
 world.dispose();assert.equal(originalWall.geometry,originalGeometry,'Retry restores the original ward source geometry');
}
console.log('PASS: fence meets the rendered ward wall; '+samples+' walking/jump barrier samples, 16 attempted crossings, tree refresh, wicket approach and retry restoration.');
