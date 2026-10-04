import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const originals=new Map(['west-refinement.mjs','west-front-photo-detail.mjs'].map(name=>[new URL('../../dist/'+name,import.meta.url).href,execFileSync('git',['show','HEAD:Browser/dist/'+name],{encoding:'utf8',windowsHide:true})]));
registerHooks({load(url,context,nextLoad){const result=nextLoad(url,context);return originals.has(url)?{...result,source:originals.get(url)}:result;}});
