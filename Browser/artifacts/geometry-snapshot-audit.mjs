import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {jarmanProtected} from './jarman-scope.mjs';
import {leightonProtected} from './leighton-scope.mjs';
import {modelSourceHash} from '../model-build-inputs.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const ref=process.env.GEOMETRY_SNAPSHOT_REF,sourceHash=ref?'git:'+ref:await modelSourceHash(),names={};let anonymous;
globalThis.captureGeometryRows=(scope,rows)=>{
  if(scope==='jarman')anonymous=rows.filter(row=>row.startsWith('["",'));
  const groups=new Map();
  for(const row of rows.sort()){
    const name=JSON.parse(row)[0];
    if(!groups.has(name))groups.set(name,{count:0,hash:createHash('sha256')});
    const group=groups.get(name);group.count++;group.hash.update(row+'\n');
  }
  names[scope]=Object.fromEntries([...groups].sort(([a],[b])=>a.localeCompare(b)).map(([name,g])=>[name,{count:g.count,sha256:g.hash.digest('hex')}]));
};
const exterior=createEscapeExterior(THREE,16/9);
const geometry={jarman:jarmanProtected(THREE,exterior.model),leighton:leightonProtected(THREE,exterior.model)};
const ranges=exterior.annexe.userData.wards['leighton-newton'].userData.ranges;
if(!ref)assert.equal(await modelSourceHash(),sourceHash,'Model sources changed during the audit; rerun before accepting a baseline');
const result={ref:process.env.GEOMETRY_SNAPSHOT_REF??'working-tree',sourceHash,geometry,ranges,names};
writeFileSync(new URL(process.argv[2]??'geometry-snapshot-current.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
writeFileSync(new URL((process.argv[2]??'geometry-snapshot-current.json')+'.anonymous.gz',import.meta.url),gzipSync(JSON.stringify(anonymous)));
console.log(JSON.stringify({ref:result.ref,geometry,rangesMatch:JSON.stringify(ranges)===JSON.stringify(JSON.parse(readFileSync(new URL('../../Research/leighton-newton/protected-before.json',import.meta.url))).ranges)},null,2));
