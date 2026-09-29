import {registerHooks} from 'node:module';
// Keep all timeline assertions intact; isolate screenshots from concurrent
// browser checks that write the shared artifacts/timeline-*.png files.
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!url.endsWith('/test-timeline-browser.mjs'))return result;
 const source=String(result.source),before="new URL('./artifacts/',import.meta.url)";
 if(!source.includes(before))throw Error('Timeline output declaration changed');
 return {...result,source:source.replace(before,"new URL('./artifacts/ground-contact-timeline/',import.meta.url)")};
}});
