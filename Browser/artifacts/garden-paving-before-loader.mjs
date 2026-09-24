import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const files=['east-photo-detail.mjs','escape-exterior.mjs','redesmere-garden-photo-detail.mjs'];
const originals=new Map(files.map(file=>[file,execFileSync('git',['show','HEAD:Browser/dist/'+file],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024})]));
registerHooks({load(url,context,next){const result=next(url,context);for(const [file,source] of originals)if(url.endsWith('/dist/'+file))return {...result,source};return result;}});
