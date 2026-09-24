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
const counts={};
for(const {year} of PERIODS){
 timeline.setPeriod(year);lighting.setNight(true);
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
console.log('PASS: day default and restoration, night lighting, fixed light budget, per-period fixtures/pools, hidden-road light removal, narrow post collisions. '+JSON.stringify(counts));
