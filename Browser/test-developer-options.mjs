import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {bindDeveloperOptions} from './dist/developer-options.mjs';
import {createStairOverlay} from './dist/stair-overlay.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {batchAerialMeshes} from './dist/aerial-performance.mjs';
import {WEST_GARDEN_STAIR as garden} from './dist/west-garden-stair.mjs';
import {gunzipSync} from 'node:zlib';
import {decodeModel} from './dist/model-binary.mjs';
import {restoreAerialScene} from './dist/aerial-scene.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),timeline=prepareEstateTimeline(THREE,exterior,layouts);
timeline.setPeriod(1916);
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const original=[];exterior.model.traverse(o=>original.push([o,o.visible,o.material]));
const overlay=createStairOverlay(THREE,exterior,plan);overlay.update();
assert.equal(overlay.interior.length,8,'All eight internal floor connections, including the Library, are shown exactly once');
const upperStair=overlay.interior.find(({group})=>group.name==='Interior staircase S5:1:3').group;
upperStair.updateMatrixWorld(true);
const stairRay=new THREE.Raycaster(new THREE.Vector3(-34.85,7.9,9.5),new THREE.Vector3(0,-1,0),0,.65);
assert(stairRay.intersectObject(upperStair,true).length,'Overlay follows the single north-rising upper flight');
stairRay.ray.origin.set(-32.25,7.9,11);
assert.equal(stairRay.intersectObject(upperStair,true).length,0,'Former diagonal return is absent from the overlay');
stairRay.ray.origin.x=-28.95;
assert.equal(stairRay.intersectObject(upperStair,true).length,0,'Former wall-side upper flight is absent from the overlay');
assert(overlay.parts.length>200,'Includes named treads and otherwise unnamed iron flights/decks');
const has=(x,z)=>overlay.parts.some(({mesh})=>{if(!mesh.visible)return false;const b=new THREE.Box3().setFromObject(mesh);return x>=b.min.x-.2&&x<=b.max.x+.2&&z>=b.min.z-.2&&z<=b.max.z+.2;});
for(const [name,x,z] of [['front entrance',0,26],['west garden',garden.lowerX,(garden.groundZ+garden.turnZ)/2],['west return',-43,44.5],['east forward',42,35],['west inner',-20.3,-28],['east inner',20.3,-28],['central rear',8.9,-40],['east courtyard',71,1.7],['rear return',64,-31.75]])assert(has(x,z),name+' has an overlay at its actual tread location');
for(const [object,visible,material] of original){assert.equal(object.visible,visible);assert.equal(object.material,material);}
assert.equal(original.length,(()=>{let n=0;exterior.model.traverse(()=>n++);return n;})(),'Overlay never enters the collision/shadow model');
const annexe=overlay.parts.filter(({source})=>source.name==='Blue external stair tread');assert.equal(annexe.length,36);
timeline.setPeriod(2021);overlay.update();assert(annexe.every(({mesh})=>!mesh.visible),'Demolished annexe stairs disappear');
timeline.setPeriod(1916);batchAerialMeshes(THREE,exterior.model);const visibility=[];exterior.model.traverse(o=>visibility.push([o,o.visible]));
const batched=createStairOverlay(THREE,exterior,plan);batched.update();
assert.equal(batched.parts.length,overlay.parts.length,'Hidden batch originals give identical stair coverage');
assert.equal(batched.parts.filter(({mesh})=>mesh.visible).length,overlay.parts.length);
for(const [object,visible] of visibility)assert.equal(object.visible,visible,'Overlay preserves batch visibility');
if(process.argv.includes('--compiled')){
 const manifest=JSON.parse(await readFile(new URL('./dist/compiled/manifest.json',import.meta.url))),packed=await readFile(new URL('./dist/compiled/'+manifest.file,import.meta.url));
 const raw=gunzipSync(packed),{exterior:compiled}=restoreAerialScene(THREE,decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length)),1.5);
 compiled.timeline.setPeriod(1916);const loaded=createStairOverlay(THREE,compiled,plan);loaded.update();
 assert.equal(loaded.interior.length,8);assert(loaded.parts.filter(({mesh})=>mesh.visible).length>200,'Deserialized compiled geometry retains the stair sources');
 const blue=loaded.parts.filter(({source})=>source.name==='Blue external stair tread');assert.equal(blue.length,36);assert(blue.every(({mesh})=>mesh.visible));
 compiled.timeline.setPeriod(2021);loaded.update();assert(blue.every(({mesh})=>!mesh.visible));
 console.log(`PASS: existing compiled binary supplies ${loaded.parts.length} stair surfaces with correct period visibility.`);
}

class Element extends EventTarget{
 hidden=false;attributes={};setAttribute(key,value){this.attributes[key]=value;}
 send(type,options={}){const event=new Event(type,{cancelable:true});Object.assign(event,options);this.dispatchEvent(event);return event;}
}
const elements=Object.fromEntries(['developerToggle','developerShortcuts','developerMapToggle','stairOverlayToggle','developerStatus'].map(id=>[id,new Element()]));
const root={getElementById:id=>elements[id]},target=new Element();
let mapVisible=false,planReads=0;
const loadMap=async()=>({createDeveloperMap:()=>({show(){mapVisible=true;},hide(){mapVisible=false;}})});
const developer=bindDeveloperOptions({THREE,exterior,plan:async()=>{planReads++;return plan;},root,target,loadMap});
const key=(code,extra={})=>target.send('keydown',{code,...extra});
for(const page of ['aerial.html','explore.html'])assert.match(await readFile(new URL('./dist/'+page,import.meta.url),'utf8'),/<button id="developerToggle"[^>]*\bhidden[\s>]/,page+' hides the shortcut before scripts load');
assert(elements.developerToggle.hidden&&elements.developerShortcuts.hidden);assert(!key('KeyM').defaultPrevented);assert(!developer.staircases&&!developer.fullMap);
for(const extra of [{repeat:true},{ctrlKey:true},{altKey:true},{metaKey:true},{shiftKey:true,key:'_'}])key('Minus',extra);
assert(elements.developerToggle.hidden,'Ignored shortcuts cannot reveal developer options');
key('Minus');assert(developer.enabled&&!elements.developerToggle.hidden&&!elements.developerShortcuts.hidden);
for(const extra of [{repeat:true},{ctrlKey:true},{altKey:true},{metaKey:true},{shiftKey:true,key:'_'}])key('Minus',extra);
assert(developer.enabled,'Held keys and browser shortcuts cannot toggle the option');
elements.developerToggle.send('click');assert(!developer.enabled);
key('NumpadSubtract');key('KeyM');
await new Promise(resolve=>setTimeout(resolve,0));
assert(developer.fullMap&&developer.mapRevealed&&mapVisible&&!developer.staircases,'Plain M opens the full map without enabling the staircase overlay');
key('KeyM',{repeat:true});assert(developer.fullMap);key('KeyM');assert(!developer.fullMap&&!mapVisible&&developer.mapRevealed,'Closing the full map retains the minimap reveal');
key('KeyM',{shiftKey:true});
await new Promise(resolve=>setTimeout(resolve,0));
assert(developer.staircases&&developer.overlay,'Shift+M loads the overlay lazily');
assert.equal(planReads,1,'Map and staircase overlay share the lazily loaded floor plan');
key('KeyM',{repeat:true,shiftKey:true});assert(developer.staircases);key('KeyM',{shiftKey:true});assert(!developer.staircases);key('KeyM',{shiftKey:true});
key('KeyM');assert(developer.fullMap&&mapVisible);
key('Minus');assert(!developer.staircases&&elements.developerShortcuts.hidden,'Disabling developer mode clears the overlay');
assert(!developer.fullMap&&!developer.mapRevealed&&!mapVisible,'Disabling developer mode closes the map and restores explored-only mapping');
assert(!elements.developerToggle.hidden,'The discovered shortcut remains available for clicking');
const nextPage=bindDeveloperOptions({THREE,exterior,plan:async()=>plan,root,target:new Element()});
assert(!nextPage.enabled&&!nextPage.staircases&&!nextPage.mapRevealed&&!nextPage.fullMap,'A new page starts with developer options disabled');
assert(elements.developerToggle.hidden&&elements.developerShortcuts.hidden,'A new page waits for its own minus press to reveal shortcuts');
console.log(`PASS: gated/repeat-safe shortcuts, page-local discovery, eight internal connections, ${overlay.parts.length} exterior surfaces, actual flight positions, timeline and batch parity without model mutation.`);
