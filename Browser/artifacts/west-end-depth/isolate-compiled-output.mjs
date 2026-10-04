import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!/\/test-(precompiled-models|timeline-browser)\.mjs$/.test(url))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 return {...result,source:source.replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/west-end-depth/compiled-tests/',import.meta.url)")};
}});
