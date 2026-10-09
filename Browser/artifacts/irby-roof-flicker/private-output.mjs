import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!url.endsWith('/test-precompiled-models.mjs'))return result;
 const source=String(result.source).replace("const artifacts=new URL('./artifacts/',import.meta.url)","const artifacts=new URL('./artifacts/irby-roof-flicker/precompiled-final/',import.meta.url)");
 assert.notEqual(source,String(result.source),'Change only the screenshot destination, retaining all model assertions');
 return {...result,source};
}});
