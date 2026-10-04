import {registerHooks} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
registerHooks({load(url,context,next){
  const name=url.split('/').pop(),baseline=new URL('baseline/'+name,import.meta.url);
  return url.includes('/Browser/dist/')&&existsSync(baseline)?{format:'module',source:readFileSync(baseline,'utf8'),shortCircuit:true}:next(url,context);
}});
