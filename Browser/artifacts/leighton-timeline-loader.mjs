import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const r=next(url,context);if(url.endsWith('/test-timeline-browser.mjs'))return {...r,source:String(r.source).replace("const artifacts=new URL('./artifacts/'","const artifacts=new URL('./artifacts/leighton-timeline/'")};return r;}});
