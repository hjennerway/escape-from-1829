import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const names=['escape-exterior.mjs','east-photo-detail.mjs','redesmere-garden-photo-detail.mjs'];
const originals=new Map(names.map(name=>[name,execFileSync('git',['show','HEAD:Browser/dist/'+name],{encoding:'utf8',windowsHide:true})]));
registerHooks({load(url,context,next){const result=next(url,context);for(const [name,source] of originals)if(url.endsWith('/dist/'+name))return {...result,source};return result;}});
