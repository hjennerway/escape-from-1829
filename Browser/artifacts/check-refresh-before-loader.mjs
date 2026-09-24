import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const names=['escape-exterior.mjs','churton-ward.mjs','east-forward-end-photo-detail.mjs','entrance-symmetry.mjs','inner-court-photo-detail.mjs','west-front-photo-detail.mjs','west-lawn-photo-detail.mjs'];
const originals=new Map(names.map(name=>[name,execFileSync('git',['show','HEAD:Browser/dist/'+name],{encoding:'utf8',windowsHide:true})]));
registerHooks({load(url,context,next){const result=next(url,context);for(const [name,source] of originals)if(url.endsWith('/dist/'+name))return {...result,source};return result;}});
