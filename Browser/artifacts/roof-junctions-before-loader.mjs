import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
 const name=new URL(url).pathname.split('/').pop();
 if(url.includes('/Browser/dist/')&&['entrance-west-photo-detail.mjs','front-inside-corners.mjs'].includes(name))return {format:'module',source:readFileSync(new URL('roof-junctions-before-'+name+'.txt',import.meta.url),'utf8'),shortCircuit:true};
 return next(url,context);
}});
