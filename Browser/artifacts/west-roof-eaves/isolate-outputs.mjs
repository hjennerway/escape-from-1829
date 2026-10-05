import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(/\/build-models\.mjs$/.test(url)){
  const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
  return {...result,source:source.replace("import {chromium} from 'playwright';","import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';").replace('await chromium.launch(','await launchHardwareBrowser(')};
 }
 if(!/\/test-(?:timeline-browser|precompiled-models|ground-contact)\.mjs$/.test(url))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 return {...result,source:source.replaceAll("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/west-roof-eaves/compiled-tests/',import.meta.url)").replaceAll("new URL('artifacts/ground-contact-audit.json',import.meta.url)","new URL('artifacts/west-roof-eaves/ground-contact-audit.json',import.meta.url)").replaceAll("new URL('./artifacts/precompiled-", "new URL('./artifacts/west-roof-eaves/precompiled-")};
}});

