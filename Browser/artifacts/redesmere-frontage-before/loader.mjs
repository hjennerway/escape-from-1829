import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const root=new URL('../../dist/',import.meta.url);
registerHooks({load(url,context,nextLoad){
  for(const name of ['escape-exterior.mjs','east-photo-detail.mjs'])
    if(url===new URL(name,root).href)return {format:'module',shortCircuit:true,source:readFileSync(new URL(name,import.meta.url),'utf8')};
  return nextLoad(url,context);
}});
