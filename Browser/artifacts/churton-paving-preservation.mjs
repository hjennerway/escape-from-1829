import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from '../dist/vendor/three.module.js';
import {jarmanProtected} from './jarman-scope.mjs';
import {leightonProtected} from './leighton-scope.mjs';
const original=readFileSync(new URL('./churton-paving-before.mjs',import.meta.url),'utf8');
registerHooks({load(url,context,next){
 if(url.endsWith('/churton-ward.mjs?paving-before'))return {format:'module',source:original,shortCircuit:true};
 if(url.endsWith('/escape-exterior.mjs?paving-before'))return {format:'module',source:readFileSync(new URL('../dist/escape-exterior.mjs',import.meta.url),'utf8').replace("'./churton-ward.mjs'","'./churton-ward.mjs?paving-before'"),shortCircuit:true};
 return next(url,context);
}});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const before=(await import('../dist/escape-exterior.mjs?paving-before')).createEscapeExterior(THREE,1.5);
const after=(await import('../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.5);
const groundNames=new Set(['Ward perimeter gravel','Mast-side access','Estate-side access','Church-facing lawn']);
for(const e of [before,after])for(const o of [...e.churtonWard.children])if(groundNames.has(o.name))o.removeFromParent();
assert.deepEqual(jarmanProtected(THREE,after.model),jarmanProtected(THREE,before.model),'All estate geometry except the four intended ground meshes stays exact');
const oldScene=(await import('../dist/escape-exterior.mjs?paving-before')).createEscapeExterior(THREE,1.5);
const newScene=(await import('../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.5);
const jarmanPath=new URL('../../Research/jarman/protected-geometry.json',import.meta.url),leightonPath=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const savedJarman=JSON.parse(readFileSync(jarmanPath)),savedLeighton=JSON.parse(readFileSync(leightonPath));
const oldJarman=jarmanProtected(THREE,oldScene.model),oldLeighton=leightonProtected(THREE,oldScene.model);
const newJarman=jarmanProtected(THREE,newScene.model),newLeighton=leightonProtected(THREE,newScene.model);
const matches=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const evidence={oldJarman,newJarman,oldLeighton,newLeighton,savedJarman,savedLeighton:savedLeighton.geometry};
writeFileSync(new URL('./churton-paving-preservation.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
if(matches(savedJarman,newJarman)&&matches(savedLeighton.geometry,newLeighton))console.log('PASS: ground changes isolated; snapshots already current.');
else if(matches(savedJarman,oldJarman)&&matches(savedLeighton.geometry,oldLeighton)){
 assert.equal(newJarman.primitives,oldJarman.primitives-2);assert.equal(newLeighton.count,oldLeighton.count-2);
 if(process.argv.includes('--refresh')){
  assert.deepEqual(JSON.parse(readFileSync(jarmanPath)),savedJarman);assert.deepEqual(JSON.parse(readFileSync(leightonPath)),savedLeighton);
  writeFileSync(jarmanPath,JSON.stringify(newJarman,null,2)+'\n');writeFileSync(leightonPath,JSON.stringify({...savedLeighton,geometry:newLeighton},null,2)+'\n');
 }
 console.log('PASS: only four ground meshes change; original paving exactly reproduces both saved snapshots; consolidated paving removes two meshes.');
}else console.log('Ground isolation passes; concurrent changes prevent exact reproduction of saved snapshots. Snapshots left unchanged.');
