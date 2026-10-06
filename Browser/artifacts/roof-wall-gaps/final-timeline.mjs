// Run the unchanged timeline assertions with private capture paths. Windows can
// hold a shared screenshot open while other model reviews use this workspace.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';

const test=new URL('../../test-timeline-browser.mjs',import.meta.url);
const original=readFileSync(test,'utf8');
const source=original.replace("const artifacts=new URL('./artifacts/',import.meta.url)",
 "const artifacts=new URL('./artifacts/roof-wall-gaps/timeline-verified/',import.meta.url)");
assert.notEqual(source,original,'Redirect only the output directory, retaining all timeline assertions');
registerHooks({load(url,context,nextLoad){
 if(url===test.href)return {format:'module',source,shortCircuit:true};
 return nextLoad(url,context);
}});
await import(test.href);
