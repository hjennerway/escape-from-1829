import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
if(process.argv.includes('--baseline')){
 const sources=JSON.parse(readFileSync(new URL('before-sources.json',import.meta.url),'utf8'));
 registerHooks({load(url,context,next){const name=url.split('/').pop();return sources[name]?{format:'module',source:sources[name],shortCircuit:true}:next(url,context);}});
}
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {createEscapeExterior}=await import('../../dist/escape-exterior.mjs');
const {model}=createEscapeExterior(THREE,4/3);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let panes=0;
// Fixed photograph-derived probes, independent of the model's sash metadata.
for(const y of [2,6.45])for(const z of [17.25,19.75])for(const u of [-.26,.26])for(const v of [-.27,.27]){
 ray.set(new THREE.Vector3(-40.665,y+2.35*v,z+1.05*u),new THREE.Vector3(1,0,0));
 const hit=ray.intersectObject(model,true)[0];
 assert.equal(hit?.object.material.color.getHex(),0x78989f,'The photographed green-face panes must be exposed');panes++;
}
console.log(`PASS: ${panes} fixed green-face pane probes.`);
