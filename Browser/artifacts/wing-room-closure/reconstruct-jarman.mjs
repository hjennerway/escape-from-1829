import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
const root=new URL('../../../',import.meta.url),dist=new URL('../../dist/',import.meta.url),ref=process.argv[2]??'16abbbb',tag='?jarmanHistorical='+ref,saved=new Map();
registerHooks({
 resolve(specifier,context,next){const r=next(specifier,context);if(context.parentURL?.endsWith(tag)&&r.url.startsWith(dist.href)&&r.url.endsWith('.mjs'))r.url+=tag;return r;},
 load(url,context,next){
  if(!url.endsWith(tag))return next(url,context);
  const name=url.slice(dist.href.length,-tag.length);
  if(!saved.has(name))saved.set(name,execFileSync('git',['show',ref+':Browser/dist/'+name],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024}));
  return {format:'module',source:saved.get(name),shortCircuit:true};
 }
});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const old=(await import(new URL('escape-exterior.mjs'+tag,dist))).createEscapeExterior(THREE,1.6);
const report={ref,modules:saved.size,geometry:{jarman:jarmanProtected(THREE,old.model),leighton:leightonProtected(THREE,old.model)}};
writeFileSync(new URL('./jarman-historical-'+ref+'.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
