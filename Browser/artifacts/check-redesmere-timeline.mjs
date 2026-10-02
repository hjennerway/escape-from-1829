import {readFile} from 'node:fs/promises';

// Run the existing timeline assertions unchanged, isolating screenshots from
// other validations sharing this workspace and locking the default outputs.
const testURL=new URL('../test-timeline-browser.mjs',import.meta.url);
const source=(await readFile(testURL,'utf8'))
 .replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/redesmere-eaves/timeline/',import.meta.url)")
 .replaceAll('import.meta.url',JSON.stringify(testURL.href))
 .replace("from 'playwright'",`from '${import.meta.resolve('playwright')}'`)
 .replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,testURL).href}'`);
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
