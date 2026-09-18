import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts,fitAerialLayouts} from './dist/aerial-layouts.mjs';
import {earthToScene} from './dist/earth-registration.mjs';
import {WILLOWS,WILLOWS_PIN,WILLOWS_VIEWS,WILLOWS_WALK,willowsPoint} from './dist/willows.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {createAerialControls} from './dist/aerial-controls.mjs';
import {createBuildingSelection,isBuildingVisible} from './dist/building-selection.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const kml=readFileSync(new URL('../Research/willows/1829-9.kml',import.meta.url),'utf8');
const placemark=[...kml.matchAll(/<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/g)].find(m=>m[1].includes('<name>The Willows</name>'))[1];
const [lon,lat]=placemark.match(/<Point>[\s\S]*?<coordinates>([^<]+)/)[1].split(',').map(Number);
assert.deepEqual(WILLOWS_PIN,{latitude:lat,longitude:lon});
const e=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,e),site=e.willows;
assert.deepEqual([site.position.x,site.position.z],earthToScene(lat,lon),'Use the Point, not LookAt');
assert.equal(site.parent,layouts.shared);assert.equal(e.model.getObjectsByProperty('name','The Willows').length,1);
e.scene.updateMatrixWorld(true);
const roof=site.getObjectByName('Willows red pitched roof'),ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);ray.camera=e.camera;
let samples=0;
for(let x=-WILLOWS.length/2+.1;x<WILLOWS.length/2;x+=.4)for(let z=-WILLOWS.width/2+.1;z<WILLOWS.width/2;z+=.4){
 ray.set(new THREE.Vector3(...willowsPoint(x,12,z)),down);assert(ray.intersectObject(roof).length,'Roof fully covers rectangle');samples++;
}
assert([...roof.geometry.attributes.normal.array].filter((_,i)=>i%3===1).every(y=>y>0),'Roof faces upward');
site.traverse(o=>{if(o.isMesh)for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite));});
const entry=site.userData.openings[1];
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(isBuildingVisible(site),historic||modern);
 const obstacles=exteriorObstacles(THREE,e.model),blocked=(x,z)=>{const p=willowsPoint(x,0,z);return obstacles.some(o=>obstacleContains(o,p[0],p[2]));};
 assert.equal(blocked(-8,WILLOWS.width/2),historic||modern,'Wall collisions follow layout visibility');
 for(const o of site.userData.openings)for(let z=-2.3;z<5;z+=.25)assert(!blocked(o.x,z),'Open bays are walkable through the actual wall');
 if(!historic&&!modern)continue;
 const walker=createWalker(e.camera,obstacles);
 walker.setView({position:willowsPoint(entry.x,1.8,6),target:willowsPoint(entry.x,1.8,-3)});
 walker.keys.add('KeyW');for(let i=0;i<14;i++)walker.update(.1);
 assert(site.worldToLocal(e.camera.position.clone()).z<0,'Walk into the distant building');
 for(let i=0;i<24;i++)walker.update(.1);
 assert(site.worldToLocal(e.camera.position.clone()).z>-WILLOWS.width/2,'Rear wall stops walking');
 walker.setView(WILLOWS_WALK);const before=e.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);assert(e.camera.position.distanceTo(before)>.45,'Walking preset is not blocked by old estate bounds');
 e.camera.position.set(...WILLOWS_VIEWS.willows.position);e.camera.lookAt(...WILLOWS_VIEWS.willows.target);
 const controls=createAerialControls(e.camera);controls.sync(WILLOWS_VIEWS.willows.target);controls.panPixels(5,2);
 assert(Math.hypot(controls.target.x-WILLOWS.x,controls.target.z-WILLOWS.z)<2,'Panning must not snap back to the old estate limits');
 for(const aspect of [16/9,9/16]){e.camera.aspect=aspect;fitAerialLayouts(THREE,e,layouts);e.camera.updateMatrixWorld(true);const p=new THREE.Vector3(...willowsPoint(0,2,0)).project(e.camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1&&Math.abs(p.z)<1,'Fit includes the distant building');const fitControls=createAerialControls(e.camera);const actualTarget=fitAerialLayouts(THREE,e,layouts);fitControls.sync(actualTarget);const fitPosition=e.camera.position.clone();fitControls.panPixels(0,0);assert(e.camera.position.distanceTo(fitPosition)<.001,'Portrait fit must not snap to the former maximum zoom distance');}
}
layouts.setVisible('historic',true);
const selection=createBuildingSelection(THREE,e);assert(selection.entries.some(entry=>entry.id==='willows'),'Willows has selectable building geometry');
const groundBounds=new THREE.Box3().setFromObject(e.terrain);assert(groundBounds.containsPoint(new THREE.Vector3(WILLOWS.x,-.15,WILLOWS.z)),'KML pin stays on the existing terrain');
console.log(`PASS: The Willows exact KML Point, ${samples} roof samples, hollow bays, walking, distant aerial pan, layout fitting, selection and all four visibility states.`);
