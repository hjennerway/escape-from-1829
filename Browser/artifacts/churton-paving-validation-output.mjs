import {registerHooks} from 'node:module';
const tests=new Set(['test-precompiled-models.mjs','test-timeline-browser.mjs']);
registerHooks({load(url,context,next){const result=next(url,context);if(!tests.has(url.split('/').at(-1)))return result;return {...result,source:String(result.source).replaceAll("'./artifacts/","'./artifacts/churton-paving-validation/")};}});
