import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const sources=JSON.parse(readFileSync(new URL('before-sources.json',import.meta.url),'utf8'));
registerHooks({load(url,context,next){
  const name=url.split('/').pop();
  return sources[name]?{format:'module',source:sources[name],shortCircuit:true}:next(url,context);
}});
