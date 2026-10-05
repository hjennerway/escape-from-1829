import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from '../../dist/vendor/three.module.js';

if(!process.argv.includes('--baseline'))registerHooks({
  resolve(specifier,context,next){
    if(specifier==='./west-garden-stair.mjs'&&context.parentURL.endsWith('/dist/west-front-photo-detail.mjs'))
      return {url:new URL('../../dist/west-garden-stair.mjs',import.meta.url).href,shortCircuit:true};
    return next(specifier,context);
  },
  load(url,context,next){
    if(url.endsWith('/dist/west-garden-stair.mjs'))return {format:'module',source:readFileSync(new URL('./west-garden-stair.mjs',import.meta.url),'utf8'),shortCircuit:true};
    const result=next(url,context);
    if(url.endsWith('/dist/west-front-photo-detail.mjs')){
      let source=readFileSync(new URL(url),'utf8');
      source=source.replace("import {addExteriorStairRail} from './exterior-stair-rail.mjs';","import {addWestGardenStair} from './west-garden-stair.mjs';");
      source=source.replace(/  for\(const \[x,y\] of \[\[-58\.6,4\.25\],\[-58,8\.5\]\]\).*\r?\n/,'');
      source=source.replace(/  const stair=new THREE.Group\(\);stair.name='West front iron return stair';[\s\S]*?(?=  \/\/ Lower forward range:)/,"  addWestGardenStair(THREE,{model,iron,door});\n\n");
      return {...result,source};
    }
    return result;
  }
});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
if(process.argv.includes('--doors')){await import('../../test-exterior-door-supports.mjs');process.exit(0);}
const {createEscapeExterior}=await import('../../dist/escape-exterior.mjs');
const {createAsylumOutside}=await import('../../dist/asylum-outside.mjs');
const exterior=createEscapeExterior(THREE,1.5),walker=createAsylumOutside(THREE,exterior);
const ray=new THREE.Raycaster(),meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
for(const y of [4.25,8.5]){
  for(const dx of [-.55,-.25,.25,.55]){
    ray.set(new THREE.Vector3(-63+dx,y+1.36,14.3),new THREE.Vector3(0,0,-1));ray.far=1;
    assert.equal(ray.intersectObjects(meshes)[0]?.object.material.color.getHex(),0x172e50,'Both blue leaves face the recessed wall');
  }
}
for(const name of ['West garden middle door walkway','West garden upper door walkway','West garden upper flight landing']){
  const box=new THREE.Box3().setFromObject(exterior.model.getObjectByName(name));assert(Math.abs(box.max.x-box.min.x-1.2)<1e-5,'Door approach keeps stair width '+name);
}
const route=[[-60.3,14.8],[-60.3,20],[-63,20],[-63,14.3],[-63,20],[-61.65,20],[-61.65,16],[-61.65,14.9],[-63,14.9],[-63,14.3]];
const actor={x:route[0][0],z:route[0][1],y:.3};
function follow(points){
  for(const [x,z] of points){
    for(let i=0;i<1800&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){
      const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.025,d),prior=actor.y;
      walker.update(actor,dx/d*step,dz/d*step,.01);
      assert(walker.clear(actor.x,actor.z,actor.y),'Every movement clears the railings');
      assert(Math.abs(actor.y-prior)<.3,'No sudden height change');
      if(i%17===0){const height=actor.y;walker.update(actor,0,0,.1);assert(Math.abs(actor.y-height)<.01,'Stops retain support');}
    }
    assert(Math.hypot(actor.x-x,actor.z-z)<.04,'Stair route open '+JSON.stringify({actor,target:[x,z]}));
  }
}
follow(route.slice(1));assert(actor.y>8.4,'Upper doorway accessible');
follow([...route].reverse().slice(1));assert(actor.y<.7,'Ground return accessible');
console.log('PASS: draft doors, uniform walkway widths, stopped/restarted climb and descent.');
if(process.argv.includes('--clearance'))await import('../../test-exterior-stair-clearance.mjs');
if(process.argv.includes('--doors'))await import('../../test-exterior-door-supports.mjs');
