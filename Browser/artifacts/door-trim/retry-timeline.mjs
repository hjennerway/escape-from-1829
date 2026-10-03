import {registerHooks} from 'node:module';
const target=new URL('../../test-timeline-browser.mjs',import.meta.url);
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(url===target.href)return {...result,source:String(result.source).replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/door-trim/timeline/',import.meta.url)")};
 return result;
}});
await import(target.href);
