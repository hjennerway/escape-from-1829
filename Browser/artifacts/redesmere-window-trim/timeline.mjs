import {registerHooks} from 'node:module';
// Keep the full production assertions, with captures in this repair's directory.
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(url.endsWith('/test-timeline-browser.mjs'))return {...result,source:String(result.source).replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/redesmere-window-trim/timeline/',import.meta.url)")};
 return result;
}});
await import('../../test-timeline-browser.mjs');
