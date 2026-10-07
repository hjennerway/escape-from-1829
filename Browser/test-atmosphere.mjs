import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createDayNight,STREET_LIGHT_LIMIT} from './dist/day-night.mjs';
import {sampleLanding} from './dist/aerial-controls.mjs';
import {COUNTRYSIDE_BOUNDS,distanceFromEstate,countrysideHeight} from './dist/countryside.mjs';
import {ESCAPE_SUN_OFFSETS} from './dist/landing-scene.mjs';

function fixture(options){
 const scene=new THREE.Scene(),model=new THREE.Group(),camera=new THREE.PerspectiveCamera();
 scene.background=new THREE.Color(0xb5c7cd);scene.fog=new THREE.FogExp2(0xb5c7cd,.0019);
 scene.add(model,new THREE.HemisphereLight(0xe4eff2,0x59634a,2),new THREE.DirectionalLight(0xffe2b7,2.8));
 const glass=new THREE.MeshStandardMaterial({color:0x56737d,roughness:.4,metalness:.3});
 for(let i=0;i<30;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,2,.05),glass);mesh.position.set(i*2,4,0);model.add(mesh);}
 const renderer={toneMappingExposure:1.25};let invalidations=0;
 const exterior={scene,model,camera,invalidateShadows(){invalidations++;}};
 const lighting=createDayNight(THREE,exterior,renderer,options);
 return {exterior,renderer,lighting,glass,get invalidations(){return invalidations;}};
}
const f=fixture({twilight:true,reducedMotion:false,random:()=>.5}),{lighting,exterior}=f;
const originalChildren=exterior.model.children.slice(),sky=lighting.atmosphere.sky;
const sun=exterior.scene.children.find(o=>o.isDirectionalLight),dayPosition=sun.position.clone();
lighting.setNight(true);
assert.equal(lighting.atmosphere.mode,'dusk');assert.equal(lighting.windows.selected.length,13);
assert.equal(lighting.lights.length,STREET_LIGHT_LIMIT);assert.equal(f.invalidations,1);
assert.equal(lighting.mode,'dusk');assert.notDeepEqual(sun.position,dayPosition);
assert.equal(sky.parent,exterior.scene);assert(!sky.castShadow&&!sky.material.depthWrite);
assert.deepEqual(exterior.model.children,originalChildren,'Atmosphere leaves model hierarchy and collisions alone');
const selected=[...lighting.windows.selected];lighting.update(.05);assert.equal(lighting.atmosphere.time,.05);
assert.deepEqual(lighting.windows.selected,selected,'Cloud movement cannot reshuffle lit rooms');
const shader={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};
f.glass.onBeforeCompile(shader);
assert(shader.uniforms.nightWindows&&shader.uniforms.groundMist,'Height fog composes with window lighting');
assert(shader.fragmentShader.includes('pleats'));assert(shader.vertexShader.includes('vWeatherPosition='));
assert(shader.fragmentShader.includes('texture2D(emissiveMap,vEmissiveMapUv)'),'Proxy frame mask is retained');
assert(shader.fragmentShader.includes('passingCloud')&&shader.uniforms.countrysideHaze,'Cloud shadows and distant haze compose with window lighting');
const landscape=lighting.atmosphere.landscape;
assert.equal(landscape.group.parent,exterior.scene);assert.equal(landscape.group.children.length,3,'Scenery uses only three draw calls');
assert(landscape.ground.geometry.attributes.normal.array.every((value,i)=>i%3!==1||value>.9),'Meadows face upward');
for(const t of [...landscape.trees,...landscape.hedges])assert(distanceFromEstate(t.x,t.z)>20,'No scenic planting intrudes into the mapped estate');
const b=COUNTRYSIDE_BOUNDS;
for(const x of [b.minX,0,b.maxX])for(const z of [b.minZ,0,b.maxZ])assert.equal(countrysideHeight(x,z),-.15);
assert(countrysideHeight(-1000,-1000)>0&&countrysideHeight(-1000,-1000)<35,'Countryside relief stays gentle');
lighting.setMode('night');assert.equal(lighting.windows.selected.length,3);assert.equal(lighting.mode,'night');
lighting.setMode('dusk');assert.deepEqual(lighting.windows.selected,selected,'Dusk/night transitions preserve room priorities');
lighting.setNight(false);assert.equal(lighting.atmosphere.mode,'day');assert.equal(shader.uniforms.groundMist.value,0);
assert.deepEqual(sun.position,dayPosition,'Day restores the original sun position');
assert.equal(lighting.windows.selected.length,0);assert.equal(f.renderer.toneMappingExposure,1.25);
const reduced=fixture({reducedMotion:true});reduced.lighting.setNight(true);reduced.lighting.update(1);
assert.equal(reduced.lighting.atmosphere.time,0);assert.equal(reduced.lighting.atmosphere.mode,'night');
assert.equal(reduced.lighting.windows.selected.length,3,'Night illuminates one window in ten');
const eastern=fixture({sunOffsets:ESCAPE_SUN_OFFSETS,reducedMotion:true}),easternSun=eastern.exterior.scene.children.find(o=>o.isDirectionalLight);
easternSun.matrixAutoUpdate=false;
for(const mode of ['day','dusk','night','day']){
 easternSun.shadow.needsUpdate=false;eastern.lighting.setMode(mode);
 const offset=easternSun.getWorldPosition(new THREE.Vector3()).sub(easternSun.target.position);
 assert.deepEqual(offset.toArray(),ESCAPE_SUN_OFFSETS[mode],'Cached source/compiled light really moves to the eastern sky');
 assert(offset.x>0&&offset.y>0,'Source is east and above the windows');
 assert(eastern.lighting.atmosphere.sky.material.uniforms.sunDirection.value.distanceTo(offset.clone().normalize())<1e-8,'Visible sky source and cast light share a direction');
}
assert.equal(eastern.invalidations,4,'Every sunlight move invalidates exterior shadows');
for(const aspect of [16/9,390/844]){
 const options={aspect,cinematic:true,reducedMotion:true},shot=sampleLanding(0,options);
 assert.deepEqual(sampleLanding(90,options),shot,'Reduced motion freezes the frontage camera');
 const camera=new THREE.PerspectiveCamera(46,aspect,.5,2000);camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
 for(const point of [[0,3.5,19.8],[0,20,19.8]]){const p=new THREE.Vector3(...point).project(camera);assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'Entrance and pediment remain in frame');}
 assert.notDeepEqual(sampleLanding(30,{aspect,cinematic:true}),shot,'The ordinary title gently moves');
}
console.log('PASS: dusk window density, shader composition, day/night restoration, reduced motion, fixed light budget and untouched model hierarchy.');
