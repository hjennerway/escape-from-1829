import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const sources=JSON.parse(readFileSync(new URL('before-sources.json',import.meta.url),'utf8'));
registerHooks({load(url,context,nextLoad){
  const name=url.split('/').at(-1);
  if(url.includes('/dist/')&&sources[name])return {format:'module',source:sources[name],shortCircuit:true};
  return nextLoad(url,context);
}});
