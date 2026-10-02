import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
globalThis.doorAudit=[];
registerHooks({load(url,context,next){const result=next(url,context);if(url.endsWith('/photo-detail-primitives.mjs'))return {...result,source:readFileSync(new URL(url),'utf8').replace('function door(x,z,rotation=0,bottom=0){','function door(x,z,rotation=0,bottom=0){ globalThis.doorAudit.push({model,x,z,rotation,bottom});')};return result;}});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const {createEscapeExterior}=await import('../dist/escape-exterior.mjs');
const {createAerialLayouts}=await import('../dist/aerial-layouts.mjs');
const e=createEscapeExterior(THREE,1.6),layouts=createAerialLayouts(THREE,e);
e.scene.updateMatrixWorld(true);
const meshes=[];e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
const boxes=[],matrix=new THREE.Matrix4();
for(const o of meshes){
 if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
 for(let i=0;i<(o.isInstancedMesh?o.count:1);i++){
  if(o.isInstancedMesh)o.getMatrixAt(i,matrix);else matrix.identity();
  const world=new THREE.Matrix4().multiplyMatrices(o.matrixWorld,matrix),bounds=o.geometry.boundingBox.clone().applyMatrix4(world);
  if(bounds.max.y-bounds.min.y>1.5)boxes.push({o,bounds,world,index:o.isInstancedMesh?i:null});
 }
}
const report=globalThis.doorAudit.map(({model,x,z,rotation,bottom})=>{
 const position=model.localToWorld(new THREE.Vector3(x,bottom,z));
 const normal=new THREE.Vector3(Math.sin(rotation),0,Math.cos(rotation)).transformDirection(model.matrixWorld);
 const right=new THREE.Vector3(Math.cos(rotation),0,-Math.sin(rotation)).transformDirection(model.matrixWorld);
 const centre=position.clone().addScaledVector(normal,.1);
 const top=model.localToWorld(new THREE.Vector3(x,bottom+2.72,z)).y;
 const leaf=boxes.find(b=>Math.hypot(b.bounds.getCenter(new THREE.Vector3()).x-centre.x,b.bounds.getCenter(new THREE.Vector3()).z-centre.z)<.04&&Math.abs(b.bounds.max.y-top)<.01);
 if(leaf)position.y=leaf.bounds.min.y;
 const samples=[];
 for(const side of [-.55,0,.55]){
  const p=position.clone().addScaledVector(normal,.32).addScaledVector(right,side);p.y+=.4;
  ray.set(p,down);
  const hit=ray.intersectObjects(meshes,false)[0];
  samples.push({side,y:hit?.point.y,gap:hit?position.y-hit.point.y:null,name:hit?.object.name});
 }
 return {group:model.name,position:position.toArray(),normal:normal.toArray(),samples};
});
mkdirSync(new URL('./door-supports/',import.meta.url),{recursive:true});
writeFileSync(new URL('./door-supports/survey.json',import.meta.url),JSON.stringify(report,null,2));
for(const d of report)console.log(JSON.stringify({group:d.group,position:d.position,gaps:d.samples.map(s=>+(s.gap??999).toFixed(3)),supports:[...new Set(d.samples.map(s=>s.name))]}));
for(const o of meshes.filter(o=>!o.isInstancedMesh&&/door|entrance/i.test(o.name)&&!/jamb|lintel|glass|glazing|panel|rail|trim|handle|head|mullion|light|arch|roof|wall|landing|step|sash|porch|pillar|column|canopy|balustrade|paving|threshold|reveal|stile|band|cornice|leaf|chimney|gable|recessed wall|projection|range|vent|path|recessed slate|upright|frame|cap|knob|plate|cornice|verge/i.test(o.name))){
 const b=new THREE.Box3().setFromObject(o);if(b.max.y-b.min.y<1)continue;
 console.log('CUSTOM',o.name,JSON.stringify({group:o.parent.name,min:b.min.toArray(),max:b.max.toArray()}));
}
