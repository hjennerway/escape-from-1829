import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!/\/test-(precompiled-models|timeline-browser)\.mjs$/.test(url))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 const needle="new URL('./artifacts/',import.meta.url)";
 if(!source.includes(needle))throw Error('Test artifact directory was not found');
 return {...result,source:source.replaceAll(needle,"new URL('./artifacts/west-basement-extension/compiled-tests/',import.meta.url)")};
}});
