import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),openings=[];
exterior.model.traverse(o=>{
  for(const [key,value] of Object.entries(o.userData))if(/openings$/i.test(key))openings.push({name:o.name,key,value});
});
const path=new URL('rear-height-window-baseline.json',import.meta.url);
if(process.argv[2]==='before')writeFileSync(path,JSON.stringify(openings,null,2)+'\n');
else assert.deepEqual(JSON.parse(JSON.stringify(openings)),JSON.parse(readFileSync(path)),'All existing window positions and dimensions stay exact');
console.log(`PASS: ${openings.length} opening schedules ${process.argv[2]==='before'?'recorded':'unchanged'}.`);
