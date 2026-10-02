import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const result=next(url,context);if(url.endsWith('/test-timeline-browser.mjs'))return {...result,source:String(result.source).replace("const artifacts=new URL('./artifacts/',import.meta.url)","const artifacts=new URL('./artifacts/door-supports/compiled-timeline/',import.meta.url)")};return result;}});
