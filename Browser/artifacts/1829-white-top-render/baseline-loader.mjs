import {registerHooks} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
const dist=new URL('../../dist/',import.meta.url).href;
registerHooks({load(url,context,next){
 if(url.startsWith(dist)){
  const saved=new URL('before/'+url.slice(dist.length),import.meta.url);
  if(existsSync(saved))return {format:'module',source:readFileSync(saved,'utf8'),shortCircuit:true};
 }
 return next(url,context);
}});
