import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {LAMP_POSTS} from './dist/kml-11-data.mjs';
import {KML_WILLOW_TREES} from './dist/kml-tree-data.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {PERIODS} from './dist/estate-periods.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {createAerialControls} from './dist/aerial-controls.mjs';
import {LOCATION_VIEWS,LOCATION_WALKS} from './dist/location-views.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,e),timeline=prepareEstateTimeline(THREE,e,layouts);
const kml=readFileSync(new URL('../Research/kml-trees/1829-11.kml',import.meta.url),'utf8');
const lamps=LAMP_POSTS.map(p=>e.model.getObjectByName(p.name));
assert.equal(lamps.length,2);
for(const [i,lamp] of lamps.entries()){
 const spec=LAMP_POSTS[i],xml=[...kml.matchAll(/<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/g)].find(m=>m[1].includes('<name>'+spec.name+'</name>'))[1];
 assert.deepEqual(spec.coordinates,xml.match(/<Point>[\s\S]*?<coordinates>([^<]+)/)[1].split(',').map(Number));
 assert.deepEqual([lamp.position.x,lamp.position.z],[spec.x,spec.z]);
 let triangles=0;lamp.traverse(o=>{if(o.isMesh)triangles+=o.geometry.index.count/3;});assert(triangles<500);
 lamp.children.forEach((o,j)=>assert.equal(o.geometry,lamps[0].children[j].geometry));
}
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const {year} of PERIODS){
 timeline.setPeriod(year);
 for(const lamp of lamps){assert.equal(visible(lamp),year>=1915);const obs=exteriorObstacles(THREE,lamp);assert.equal(obs.some(o=>obstacleContains(o,lamp.position.x,lamp.position.z)),year>=1915);}
 for(const p of KML_WILLOW_TREES)assert(visible(e.trees.getObjectByName(p.name)));
}
const obs=exteriorObstacles(THREE,e.trees);
for(const p of KML_WILLOW_TREES)assert(obs.some(o=>obstacleContains(o,p.x,p.z)));
e.trees.visible=false;assert.deepEqual(exteriorObstacles(THREE,e.trees),[]);e.trees.visible=true;
const view=LOCATION_VIEWS['willow-planting'];e.camera.position.set(...view.position);const controls=createAerialControls(e.camera);controls.sync(view.target);controls.panPixels(0,0);assert(Math.hypot(controls.target.x-view.target[0],controls.target.z-view.target[2])<.001);
const walker=createWalker(e.camera,obs);walker.setView(LOCATION_WALKS['willow-planting']);const before=e.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);assert(e.camera.position.distanceTo(before)>.4);
console.log('PASS: exact lamp Points, shared low-poly prefabs, 1915–current visibility/collisions, all-period willow planting and distant navigation.');
