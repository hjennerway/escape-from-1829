import {assertRoadEndSurface} from './test-support/road-end-assertions.mjs';
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {PERIODS} from './dist/estate-periods.mjs';
import {createCountryside} from './dist/countryside.mjs';
import {exteriorObstacles} from './dist/explore-controls.mjs';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),l=createAerialLayouts(THREE,e),timeline=prepareEstateTimeline(THREE,e,l);
e.scene.updateMatrixWorld(true);
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
// Retired approach surfaces must not leave freestanding sides in the grass.
// This east-wing path crosses the lawn immediately beside Estates.
const retiredPath=e.mainAdmin.getObjectByName('East wing side access');
const retiredEdge=e.mainAdmin.getObjectByName('East wing side access ground contact');
assert(retiredEdge,'Inspect the reported access-path edge beside Estates');
assert.equal(visible(retiredEdge),visible(retiredPath),'Hidden access paths must hide their supporting faces');
for(const owner of l.superseded.filter(o=>o.isMesh&&o.userData.groundContactClosed)){
 assert(owner.children.some(o=>o.userData.groundContact),'Individually hidden surfaces own their supporting faces: '+owner.name);
}
const point=new THREE.Vector3(),matrix=new THREE.Matrix4(),instance=new THREE.Matrix4();
const ground=[],unsupported=[],roots=[],columns=[],skirts=[],closed=[];
e.model.traverse(o=>{
 if(!o.isMesh)return;
 let tree=false;for(let p=o;p;p=p.parent)if(p===e.trees)tree=true;
 const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
 const bounds=g.boundingBox.clone().applyMatrix4(o.matrixWorld);
 if(!tree&&!o.isInstancedMesh&&bounds.max.y<.6)ground.push(o);
 if(o.userData.roadEndFade){assertRoadEndSurface(o);return;}
 if(o.userData.groundContact){skirts.push(o);return;}
 if(o.userData.groundContactClosed)closed.push(o);
 const mat=o.material;
 if(!tree&&!o.isInstancedMesh&&(mat.userData?.estateSurface==='asphalt'||mat.userData?.estateSurface==='gravel'||mat.color?.getHex()===0xb8b9af)&&bounds.max.y<.6&&bounds.min.y>-.149&&!o.userData.groundContactClosed)unsupported.push({name:o.name,parent:o.parent.name,min:bounds.min.toArray(),max:bounds.max.toArray()});
 if(o.userData.broadleafTree)roots.push({o,index:null,type:'broadleaf',root:o.userData.broadleafTree});
 if(o.name.endsWith(' EZ-Tree branches')){let parent=o.parent;while(!parent.userData.ezTree)parent=parent.parent;roots.push({o,index:null,type:'EZ-Tree',root:parent.userData.beechTree,owner:parent});}
 if(o.isInstancedMesh&&/trunk and (branches|limbs|drooping branches)$/.test(o.name)){let parent=o.parent;const root=parent.userData.beechTree??parent.userData.oakTree??parent.userData.willowTree;if(root)roots.push({o,index:0,type:parent.userData.beechTree?'beech':parent.userData.oakTree?'oak':'willow',root});}
 if(!o.isInstancedMesh&&o.name.endsWith(' trunk')&&o.parent.userData.adminPineTree)roots.push({o,index:null,type:'pine',root:o.parent.userData.adminPineTree});
 if(o.name.startsWith('Pebbledash'))for(let i=0;i<(o.isInstancedMesh?o.count:1);i++)columns.push({o,index:o.isInstancedMesh?i:null});
});
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
function transform(o,index){if(index===null)return o.matrixWorld;o.getMatrixAt(index,instance);return matrix.multiplyMatrices(o.matrixWorld,instance);}
function foot(item,lamp=false){
 const {o,index}=item,g=o.geometry,p=g.attributes.position,m=transform(o,index);if(!g.boundingBox)g.computeBoundingBox();const bottom=g.boundingBox.min.y;
 let min=Infinity,max=-Infinity;
 for(let i=0;i<(lamp?4:p.count);i++)if(lamp||p.getY(i)<bottom+1e-4){point.fromBufferAttribute(p,i).applyMatrix4(m);min=Math.min(min,point.y);max=Math.max(max,point.y);}
 const center=new THREE.Vector3(0,bottom,0).applyMatrix4(m);return {x:item.root?.x??center.x,z:item.root?.z??center.z,min,max};
}
const states=[];
for(const year of [...PERIODS.map(p=>p.year),'historic','modern','both','hidden']){
 if(typeof year==='number')timeline.setPeriod(year);
 else {l.setVisible('historic',year==='historic'||year==='both');l.setVisible('modern',year==='modern'||year==='both');}
 assert.equal(visible(retiredEdge),visible(retiredPath),'Retired Estates path and edge agree in '+year);
 const floors=ground.filter(visible),issues=[],treesSeen=new Set();let lamps=0;
 for(const [items,lamp] of [[roots,false],[columns,true]])for(const item of items){
  if(!visible(item.owner??item.o))continue;
  const f=foot(item,lamp);ray.set(new THREE.Vector3(f.x,.6,f.z),down);
  const hit=ray.intersectObjects(floors,false).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5);
  const groundY=hit?.point.y??-.15;if(lamp)lamps++;else treesSeen.add(item.root);
  if(f.max>groundY+.012)issues.push({name:item.o.name,type:lamp?'lamp':item.type,foot:f,groundY,gap:f.max-groundY});
 }
 states.push({year,trees:treesSeen.size,lamps,issues});
}
assert.equal(unsupported.length,0,'Every elevated road/path surface has a ground-contact edge: '+JSON.stringify(unsupported));
 // Surface consolidation changes the mesh count, not support coverage.
 // Check every marked owner has its own corresponding supporting geometry.
 assert(closed.length>0,'Inspect elevated surfaces throughout the estate');
 for(const owner of closed)assert([...owner.children,...owner.parent.children].some(o=>o.userData.groundContact&&o.userData.groundContactOwner===owner.name),'Ground-contact geometry exists for '+owner.name);
 for(const root of [l.roads,l.historicRoads,l.entrance,l.countessRoundabout,l.carPark]){let found=false;root.traverse(o=>{if(o.userData.groundContact)found=true;});assert(found,'Inspect support coverage for '+root.name);}
for(const edge of skirts){
 assert.equal(edge.material.polygonOffset,false,'Vertical road faces must not inherit a slope-scaled overlay bias');
 assert(!edge.material.userData.estateGrass&&!edge.material.userData.estateSurface&&!edge.material.userData.mineralFinish,'Compiled sides retain their metre-scaled UVs instead of restoring a top-surface projection');
 const p=edge.geometry.attributes.position;
 for(let i=0;i<p.count;i+=6){
  const top=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(edge.matrixWorld);
  const foot=new THREE.Vector3().fromBufferAttribute(p,i+1).applyMatrix4(edge.matrixWorld);
  assert(foot.y<e.terrain.position.y&&top.y>foot.y,'Every outline quad extends below the lawn');
  assert(Math.hypot(top.x-foot.x,top.z-foot.z)<1e-4,'Contact does not move the road outline');
 }
 assert.deepEqual(exteriorObstacles(THREE,edge),[],'Ground-contact edges cannot block walking');
}
for(const state of states)assert.deepEqual(state.issues,[],'No floating tree or lamppost bases in '+state.year);
assert(roots.some(r=>r.type==='oak')&&roots.some(r=>r.type==='willow')&&roots.some(r=>r.type==='beech')&&roots.some(r=>r.type==='pine')&&roots.some(r=>r.type==='EZ-Tree')&&roots.some(r=>r.type==='broadleaf'),'Audit every tree family and all lawn-tree detail levels');
// Distant scenery has its own sloping ground. Check against the actual
// triangulated mesh, not just the height function that placed its trunks.
const countryside=createCountryside(THREE,e);e.scene.updateMatrixWorld(true);
const distant=countryside.group.getObjectByName('Distant tree trunks');
for(let index=0;index<distant.count;index++){
 const f=foot({o:distant,index});ray.set(new THREE.Vector3(f.x,50,f.z),down);
 const floor=ray.intersectObject(countryside.ground)[0];
 assert(floor&&f.max<=floor.point.y+.012,'Distant trunk meets its hillside: '+JSON.stringify({index,...f,ground:floor?.point.y}));
}
const result={skirts:skirts.length,distantTrees:distant.count,unsupported,states};
writeFileSync(new URL('artifacts/ground-contact-audit.json',import.meta.url),JSON.stringify(result,null,2));
console.log(`PASS: ${skirts.length} grounded road/path edges, all tree families/LODs, ${distant.count} hillside trees and every lamppost in all 13 periods and four layout states; walking stays clear.`);
