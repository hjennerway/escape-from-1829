import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);if(!url.endsWith('/build-models.mjs'))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 return {...result,source:source.replace("import {chromium} from 'playwright';","import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';").replace('await chromium.launch(','await launchHardwareBrowser(')};
}});
