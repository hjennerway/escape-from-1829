// Redirect this validation's captures without changing scene inputs/assertions.
import {registerHooks} from 'node:module';
const tests=new Set(['test-precompiled-models.mjs','test-timeline-browser.mjs','test-tree-rendering-browser.mjs','test-intro-navigation-browser.mjs','test-explore-mobile.mjs','test-front-lawn-eztree-browser.mjs','test-exterior-shadows-browser.mjs']);
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!tests.has(url.split('/').at(-1)))return result;
  return {...result,source:String(result.source).replaceAll("'./artifacts/","'./artifacts/hardware-acceleration/").replaceAll("'artifacts/","'artifacts/hardware-acceleration/")};
}});
