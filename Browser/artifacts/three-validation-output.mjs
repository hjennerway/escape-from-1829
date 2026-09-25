// Keep this migration's browser evidence separate from existing screenshots.
// node --import ./artifacts/three-validation-output.mjs test-precompiled-models.mjs
import {registerHooks} from 'node:module';
const tests=new Set(['test-precompiled-models.mjs','test-timeline-browser.mjs','test-day-night-browser.mjs','test-night-selection-browser.mjs','test-tree-rendering-browser.mjs','test-explore-mobile.mjs','test-landing-mobile.mjs']);
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!tests.has(url.split('/').at(-1)))return result;
 return {...result,source:String(result.source).replaceAll("'./artifacts/","'./artifacts/three-upgrade/")};
}});
