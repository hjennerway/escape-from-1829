import {registerHooks} from 'node:module';
// Keep every assertion and browser scenario; redirect only saved artifacts.
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!/\/test-(precompiled-models|timeline-browser)\.mjs$/.test(url))return result;
  const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
  return {...result,source:source.replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/west-court-window-roof/compiled-tests/',import.meta.url)")};
}});
