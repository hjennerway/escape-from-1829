import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {batchAerialMeshes} from './dist/aerial-performance.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),walker=createAsylumOutside(THREE,exterior),plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
for(const exit of plan.exits)for(const level of exit.levels){const [x,y,z]=level.destination;assert(walker.clear(x,z,y),exit.id+' arrival clears exterior walls');assert(Math.abs(walker.heightAt(x,z,y)-y)<.36,exit.id+' arrival is supported by the existing landing/path');}
function follow(actor,points){const trace=[];for(const [x,z] of points){for(let i=0;i<5000&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.05,d);walker.update(actor,dx/d*step,dz/d*step,.025);}assert(Math.hypot(actor.x-x,actor.z-z)<.04,'Outside stair route clears its ground-level surroundings');trace.push({...actor});}return trace;}
for(const [exit,points] of [
 ['F1',[[-21.9,-25.8],[-21.9,-30.1],[-21.9,-25.8],[-20.3,-25.8],[-20.3,-30.1],[-20.3,-30.5]]],
 ['F3',[[21.9,-25.8],[21.9,-30.1],[21.9,-25.8],[20.3,-25.8],[20.3,-30.1],[20.3,-30.5]]],
 ['F2',[[8.9,-37.3],[8.9,-43.2],[8.9,-43.5]]],
 ['F4',[[-63.55,23.9],[-61.3,23.9],[-61.3,20.8],[-61.3,20.5]]],
 ['F5',[[-39.35,44.5],[-45.75,44.5],[-45.75,46.05],[-39.35,46.05],[-38.9,46.05]]],
 ['F6',[[42,32.15],[42,31.8]]],
 ['F7',[[71,3.9],[71,1.7],[66.9,1.7],[66.6,1.7]]]
]){
 const d=plan.exits.find(e=>e.id===exit).levels.find(l=>l.floor===1).destination,actor={x:d[0],y:d[1],z:d[2]};follow(actor,points);assert(actor.y<.7,exit+' descends to the grounds');
 const trace=follow(actor,[...points].reverse().slice(1).concat([[d[0],d[2]]]));assert(actor.y>d[1]-.3,exit+' climbs back to the first-floor door '+JSON.stringify(trace));
}
console.log('PASS: every outside arrival clears walls and has support; all seven fire escapes descend/climb using the rendered treads.');
batchAerialMeshes(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain]});
const visibility=[];exterior.model.traverse(o=>visibility.push([o,o.visible]));walker.refresh();
for(const [o,visible] of visibility)assert.equal(o.visible,visible,'Walking refresh preserves batched render visibility');
const upper={x:8.9,y:5.1,z:-36.3};walker.update(upper,0,-.15,.04);assert(upper.z<-36.4&&upper.y>5,'Batched title/game exterior has the same raised landing');
console.log('PASS: game exterior batching preserves original collision/support and render visibility.');
