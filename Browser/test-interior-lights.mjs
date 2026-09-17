import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {FLOOR_HEIGHT,makeFloors} from './dist/floors.mjs';
import {createInteriorLights,INTERIOR_LIGHT_LIMIT} from './dist/interior-lights.mjs';
const floors=makeFloors(JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url))));
const lamps=[];
for(const [floor,l] of floors.entries()){
 const add=(x,z,color=0xd6c296)=>lamps.push({x:x*l.cellSize,z:z*l.cellSize,y:floor*FLOOR_HEIGHT+2.9,floor,color});
 for(let z=0;z<l.height;z++)for(let x=0;x<l.width;x++)if(l.cells[z*l.width+x]&&((z===l.galleryZ&&x%4===0)||(z%4===0&&x%4===0)))add(x,z);
 for(const stair of l.stairs){add(stair.x,stair.z);if(floor===0)add(stair.x,stair.z+1);}
 for(const exit of l.exits)add(exit.x,exit.z,0x77db97);
}
const scene=new THREE.Scene(),lighting=createInteriorLights(THREE,scene,lamps),identities=[...lighting.pool];
// Every navigable cell retains its nearest light, the correct floor/colour,
// and a fixed shader budget, including near green exit and stair lamps.
for(const [floor,l] of floors.entries())for(let z=0;z<l.height;z++)for(let x=0;x<l.width;x++)if(l.cells[z*l.width+x]){
 const player={floor,x:x*l.cellSize,z:z*l.cellSize};lighting.update(player);
 assert.equal(lighting.pool.length,INTERIOR_LIGHT_LIMIT);
 assert.equal(scene.children.length,INTERIOR_LIGHT_LIMIT);
 assert.deepEqual(lighting.pool,identities);
 const distance=lamp=>Math.hypot(lamp.x-player.x,lamp.z-player.z);
 const nearest=lamps.filter(l=>l.floor===floor).sort((a,b)=>distance(a)-distance(b))[0];
 assert.equal(distance(lighting.pool[0].position),distance(nearest));
 assert.equal(lighting.pool[0].intensity,14,'Nearest fixture retains full intensity');
 for(const light of lighting.pool){
  assert(light.visible,'Zero-intensity slots stay visible to keep the shader count fixed');
  assert.equal(light.position.y,floor*FLOOR_HEIGHT+2.9);
  assert(light.intensity>=0&&light.intensity<=14);
  assert(lamps.some(l=>l.floor===floor&&l.x===light.position.x&&l.z===light.position.z&&l.color===light.color.getHex()));
 }
}
// At a selection boundary, an excluded lamp starts/ends at zero contribution.
const a={x:-10,z:0,y:2.9,floor:0,color:0xffffff},b={...a,x:10};
const boundary=createInteriorLights(THREE,new THREE.Scene(),[a,b],{limit:1});
for(const x of [-.0001,0,.0001]){boundary.update({x,z:0,floor:0});assert(boundary.pool[0].intensity<1e-6);}
boundary.update({x:0,z:0,floor:1});assert.equal(boundary.pool[0].intensity,0);
const empty=createInteriorLights(THREE,new THREE.Scene(),[]);empty.update({x:0,z:0,floor:0});assert(empty.pool.every(l=>l.intensity===0));
console.log('PASS: fixed interior light budget across every floor cell, nearby brightness, floor height/colour, smooth selection boundary and empty floors.');
