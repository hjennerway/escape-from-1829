import {registerHooks} from 'node:module';

// Compare the remaining workshop checks with original room-shell clearance,
// without modifying working-tree sources or suppressing existing checks.
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(url.endsWith('/dist/tower-workshops.mjs'))return {...result,source:String(result.source).replace('startPadding:x0===westX?0:.32','startPadding:.32')};
 if(url.endsWith('/test-tower-workshops.mjs'))return {...result,source:String(result.source).replace(/ \/\/ The kitchen's north wall[\s\S]*?(?= \/\/ Sample texture coordinates)/,'').replace('PASS: continuous kitchen/workshop wall and plinth contact, ','BASELINE (kitchen-contact probes excluded): ')};
 return result;
}});
await import('../../test-tower-workshops.mjs');
