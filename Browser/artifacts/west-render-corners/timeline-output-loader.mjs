import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const target=new URL('../../test-timeline-browser.mjs',import.meta.url).href;
registerHooks({load(url,context,next){
 if(url!==target)return next(url,context);
 const original=readFileSync(new URL(url),'utf8');
 const source=original.replace("const artifacts=new URL('./artifacts/',import.meta.url)","const artifacts=new URL('./artifacts/west-render-corners/timeline/',import.meta.url)");
 assert.notEqual(source,original,'Redirect only the screenshot/report directory; keep every original timeline assertion');
 return {format:'module',source,shortCircuit:true};
}});
