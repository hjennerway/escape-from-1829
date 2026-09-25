import {registerHooks} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
const names=['west-refinement.mjs','escape-exterior.mjs','east-photo-detail.mjs','redesmere-garden-photo-detail.mjs','courtyard-photo-detail.mjs'];
registerHooks({load(url,context,nextLoad){
 const name=names.find(name=>url.endsWith('/dist/'+name));
 if(name){const path=new URL('./courtyard-bay-baseline/'+name,import.meta.url);if(existsSync(path))return {format:'module',source:readFileSync(path,'utf8'),shortCircuit:true};}
 return nextLoad(url,context);
}});
