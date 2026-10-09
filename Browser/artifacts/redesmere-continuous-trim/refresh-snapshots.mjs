import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const {model}=createEscapeExterior(THREE,1.5);const result={jarman:jarmanProtected(THREE,model),leighton:leightonProtected(THREE,model)};
const jpath=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lpath=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url),saved=JSON.parse(readFileSync(lpath));
if(process.argv[2]==='before'){
 assert.deepEqual(result.jarman,JSON.parse(readFileSync(jpath)));assert.deepEqual(result.leighton,saved.geometry);
}else{
 const preservation=JSON.parse(readFileSync(new URL('preservation.json',import.meta.url)));assert(preservation.passed);
 writeFileSync(jpath,JSON.stringify(result.jarman,null,2)+'\n');saved.geometry=result.leighton;writeFileSync(lpath,JSON.stringify(saved,null,2)+'\n');
}
writeFileSync(new URL(process.argv[2]+'-snapshots.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(result);
