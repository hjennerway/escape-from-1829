import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
registerHooks({load(url,context,next){
 const name=new URL(url).pathname.split('/').pop();
 if(url.includes('/Browser/dist/')&&['central-back.mjs','entrance-west-photo-detail.mjs','front-inside-corners.mjs'].includes(name))return {format:'module',source:execFileSync('git',['show','HEAD:Browser/dist/'+name],{encoding:'utf8'}),shortCircuit:true};
 return next(url,context);
}});
