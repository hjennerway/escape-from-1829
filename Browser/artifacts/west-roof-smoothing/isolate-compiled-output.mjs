import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!url.endsWith('/test-timeline-browser.mjs'))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 const needle="new URL('./artifacts/',import.meta.url)";
 if(!source.includes(needle))throw Error('Test artifact directory was not found');
 return {...result,source:source.replaceAll(needle,"new URL('./artifacts/west-roof-smoothing/compiled-tests/',import.meta.url)")};
}});
