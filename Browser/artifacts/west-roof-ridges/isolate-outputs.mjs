import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!/\/test-(?:timeline-browser|precompiled-models|ground-contact)\.mjs$/.test(url))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 return {...result,source:source.replaceAll("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/west-roof-ridges/compiled-tests/',import.meta.url)").replaceAll("new URL('artifacts/ground-contact-audit.json',import.meta.url)","new URL('artifacts/west-roof-ridges/ground-contact-audit.json',import.meta.url)").replaceAll("new URL('./artifacts/precompiled-", "new URL('./artifacts/west-roof-ridges/precompiled-")};
}});
