import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(!url.endsWith('/test-timeline-browser.mjs'))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 const needle="new URL('./artifacts/',import.meta.url)";
 if(!source.includes(needle))throw Error('Timeline artifact directory was not found');
 return {...result,source:source.replace(needle,"new URL('./artifacts/west-outline/timeline/',import.meta.url)")};
}});
