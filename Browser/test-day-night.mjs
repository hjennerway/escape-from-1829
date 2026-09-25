import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {createDayNight,STREET_LIGHT_LIMIT} from './dist/day-night.mjs';
import {visibleInScene} from './dist/street-lamps.mjs';
import {PERIODS,existsInYear} from './dist/estate-periods.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),timeline=prepareEstateTimeline(THREE,exterior,layouts);
const renderer={toneMappingExposure:1.25},lighting=createDayNight(THREE,exterior,renderer),dayColor=exterior.scene.background.clone(),dayFog=exterior.scene.fog.density;
assert.equal(lighting.night,false);assert(lighting.lamps.length>100);assert.equal(lighting.lights.length,STREET_LIGHT_LIMIT);
assert(lighting.lights.every(l=>l.intensity===0&&!l.castShadow));
assert(lighting.windows.count>2500);assert.equal(lighting.windows.selected.length,0);
const counts={};
for(const {year} of PERIODS){
 timeline.setPeriod(year);lighting.setNight(true);
 assert.equal(lighting.windows.selected.length,Math.round(lighting.windows.visibleCount/15));
 const selected=[...lighting.windows.selected];lighting.update();lighting.setNight(true);
 assert.deepEqual(lighting.windows.selected,selected,'Updates and repeated night setting keep the same windows');
 lighting.setNight(false);assert.equal(lighting.windows.selected.length,0);assert(lighting.windows.selection.image.data.every(v=>v===0));
 lighting.setNight(true);assert.notDeepEqual(lighting.windows.selected,selected,'Entering night again picks a fresh random set');
 const visible=lighting.lamps.filter(l=>visibleInScene(l.owner));counts[year]=visible.length;
 assert(visible.length>20);assert.equal(lighting.pools.count,visible.length);
 for(const lamp of lighting.lamps){
  let expected=true;for(let o=lamp.owner;o;o=o.parent)if(o.userData.estateSection)expected&&=existsInYear(o.userData.estateSection,year);
  assert.equal(visibleInScene(lamp.owner),expected,'Lamp dates follow the actual road hierarchy');
 }
 assert(lighting.night);assert.equal(exterior.scene.background.getHex(),0x070e1b);
 assert(exterior.scene.children.find(o=>o.isDirectionalLight).shadow.needsUpdate);
 const lamp=visible[0];exterior.camera.position.copy(lamp.position);lighting.update();assert(lighting.lights.some(l=>l.intensity>80));
 assert(lighting.lights.every(l=>l.intensity===0||visible.some(p=>p.position.distanceTo(l.position)<.001)),'No light may remain on a hidden road');
 lighting.setNight(false);assert.equal(exterior.scene.background.getHex(),dayColor.getHex());assert.equal(renderer.toneMappingExposure,1.25);assert.equal(exterior.scene.fog.density,dayFog);assert(lighting.lights.every(l=>l.intensity===0));
}
assert(counts[1915]>counts[1896]);assert(counts[2010]<counts[1938]);assert(counts[2021]>counts[2010]);
timeline.setPeriod(1916);const group=lighting.lamps.find(l=>l.owner.userData.streetLamps).owner,p=group.userData.streetLamps[0];
const obstacles=exteriorObstacles(THREE,group);assert(obstacles.some(b=>obstacleContains(b,p.x,p.z,0)),'Walking collides with the concrete shaft');
assert(!obstacles.some(b=>obstacleContains(b,p.x+1.5*Math.cos(p.angle),p.z-1.5*Math.sin(p.angle),0)),'Overhead arms must not block walking');
// The four screenshot-marked posts stand on the verges with each lamp head
// above its intended paved surface, and the former swept-junction post is gone.
const marked=[];exterior.model.updateMatrixWorld(true);
exterior.model.traverse(owner=>{for(const fixture of owner.userData.streetLamps??[])if(fixture.id?.startsWith('Annexe '))marked.push({owner,fixture});});
assert.equal(marked.length,4,'Two forecourt and two avenue replacements');
const groundRay=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
for(const {owner,fixture:p} of marked){
 const court=p.id.startsWith('Annexe forecourt');
 const surface=court?exterior.model.getObjectByName('Annexe central asphalt forecourt'):exterior.model.getObjectByName('Annexe front avenue');
 const paving=court?[surface]:surface.children.filter(o=>o.isMesh&&o.userData.surface==='black road');
 groundRay.set(new THREE.Vector3(p.x,1,p.z),down);
 assert.equal(groundRay.intersectObjects(paving,false).length,0,p.id+' stands off the paving');
 groundRay.set(new THREE.Vector3(p.x+2.5*Math.cos(p.angle),1,p.z-2.5*Math.sin(p.angle)),down);
 assert(groundRay.intersectObjects(paving,false).length>0,p.id+' points over the paving');
 assert(exteriorObstacles(THREE,owner).some(b=>obstacleContains(b,p.x,p.z,0)),p.id+' blocks walking at its shaft');
}
exterior.model.traverse(owner=>{for(const p of owner.userData.streetLamps??[])assert(Math.hypot(p.x-312.9823792844294,p.z+50.27196423864546)>1,'Circled junction post stays removed');});

console.log('PASS: day default and restoration, night lighting, fixed light budget, per-period fixtures/pools, hidden-road light removal, narrow post collisions. '+JSON.stringify(counts));
