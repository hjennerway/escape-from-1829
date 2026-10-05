import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(/\/test-(?:precompiled-models|timeline-browser)\.mjs$/.test(url))return {...result,source:String(result.source).replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/render-cleanup/compiled-tests/',import.meta.url)")};
 return result;
}});
