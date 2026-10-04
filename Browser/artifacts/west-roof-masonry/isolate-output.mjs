import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(!/\/test-(precompiled-models|timeline-browser|ground-contact)\.mjs$/.test(url))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 return {...result,source:source
  .replaceAll("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/west-roof-masonry/compiled-tests/',import.meta.url)")
  .replaceAll("new URL('artifacts/ground-contact-audit.json',import.meta.url)","new URL('artifacts/west-roof-masonry/ground-contact-audit.json',import.meta.url)")};
}});
