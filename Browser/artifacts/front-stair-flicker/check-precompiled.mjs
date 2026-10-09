// Keep the standard assertions; save this task's results away from open images.
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const target=new URL('../../test-precompiled-models.mjs',import.meta.url).href;
registerHooks({load(url,context,next){
 if(url!==target)return next(url,context);
 const source=readFileSync(new URL(target),'utf8').replace("const artifacts=new URL('./artifacts/',import.meta.url)","const artifacts=new URL('./artifacts/front-stair-flicker/compiled-check/',import.meta.url)");
 return {format:'module',source,shortCircuit:true};
}});
await import(target);
