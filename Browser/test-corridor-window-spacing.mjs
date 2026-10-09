import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {addWorkshopArchedWall} from './dist/workshop-gallery.mjs';

const resources=new Set(),material=colour=>new THREE.MeshStandardMaterial({color:colour});
const brick=material(0x885544),finish=material(0xccccbb),dark=material(0x222222);
const reveal={red:brick,buff:material(0xbbaa77),mortar:material(0xaaaa99),sill:material(0x999999)};
let filled=0,clear=0;const paired=[];
for(const [a,b] of [[[0,0],[36,0]],[[4,8],[4,-33.8]],[[3,5],[5,5]],[[36,0],[0,0]]]){
 const build=windowStride=>{
  const group=new THREE.Group();
  assert(addWorkshopArchedWall(THREE,{group,a,b,resources,brick,finish,reveal,material,dark,height:5.15,windowStride}));
  group.updateMatrixWorld(true);return group.children[0];
 };
 const original=build(1),reduced=build(2);
 const slots=original.userData.openings.filter(o=>o.side===1).sort((a,b)=>a.x-b.x);
 const reverse=b[0]<a[0]||b[0]===a[0]&&b[1]<a[1],keep=index=>(reverse?slots.length-1-index:index)%2===0;
 const kept=slots.filter((_,index)=>keep(index)),removed=slots.filter((_,index)=>!keep(index));
 if(a[1]===0&&b[1]===0)paired.push(kept.map(o=>reduced.localToWorld(new THREE.Vector3(o.x,0,0)).x).sort((a,b)=>a-b));
 for(const side of [-1,1]){
  const openings=reduced.userData.openings.filter(o=>o.side===side).sort((a,b)=>a.x-b.x);
  assert.deepEqual(openings.map(o=>({...o,side:1,z:.285})),kept,'Same alternate apertures on both wall faces');
  for(let i=1;i<openings.length;i++)assert(Math.abs(openings[i].x-openings[i-1].x-10.8)<1e-6);
 }
 const meshes=[];reduced.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 for(const [openings,expected] of [[kept,null],[removed,true]])for(const opening of openings)for(const side of [-1,1])for(const y of [opening.y+.45,opening.y+opening.spring+opening.radius*.6]){
  const origin=reduced.localToWorld(new THREE.Vector3(opening.x+.23,y,side===1?.9:-.65));
  const direction=new THREE.Vector3(0,0,-side).transformDirection(reduced.matrixWorld);
  const hit=new THREE.Raycaster(origin,direction,0,2).intersectObjects(meshes,false)[0];
  assert(hit,'Window bay has a visible surface');
  if(expected){
   assert.equal(hit.object.material,side===1?finish:brick,'Removed lower panes and semicircular heads become solid matching wall');filled++;
  }else{
   assert.equal(hit.object.name,'Corridor arched glazing','Retained lower panes and semicircular heads stay clear');clear++;
  }
 }
 for(const wall of [original,reduced]){
  const x=wall.userData.openings.filter(o=>o.side===1).map(o=>o.x).sort((a,b)=>a-b);
  if(wall===original)for(let i=1;i<x.length;i++)assert(Math.abs(x[i]-x[i-1]-5.4)<1e-6,'Default spacing still serves exterior and workshop room windows');
 }
}
assert(paired[0].every((x,index)=>Math.abs(x-paired[1][index])<1e-6),'Opposing even-count walls retain aligned original window pairs');
for(const resource of resources)resource.dispose();
console.log(`PASS: alternate bays retain their exact positions on both faces and opposing walls; ${clear} clear-pane and ${filled} solid infill rays across even, odd, reversed, rotated and short walls.`);
