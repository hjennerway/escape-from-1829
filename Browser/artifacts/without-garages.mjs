import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){const r=nextLoad(url,context);if(url.endsWith('/dist/escape-exterior.mjs')){let source=String(r.source);source=source.replace(/  const garagesMortuary=createGaragesMortuary[^\n]+\n/,'  const garagesMortuary=undefined;\n');return {...r,source};}return r;}});
