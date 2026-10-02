import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const data=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const dist=new URL('../../dist/',import.meta.url).href;
const baseline=(await readFile(new URL('before-architecture.mjs.txt',import.meta.url),'utf8')).replaceAll("from './",`from '${dist}`);
const testURL=new URL('../../test-asylum-wall-joins.mjs',import.meta.url);
const source=(await readFile(testURL,'utf8')).replace("from './dist/asylum-architecture.mjs'",`from '${data(baseline)}'`).replaceAll("from './",`from '${new URL('../../',import.meta.url).href}`).replaceAll('import.meta.url',JSON.stringify(testURL.href));
let failure;
try{await import(data(source));}catch(error){failure=error.message;}
assert.match(failure??'',/No recessed Brick corner/,'The new corner survey must reject the old square-ended masonry');
await writeFile(new URL('baseline-regression.json',import.meta.url),JSON.stringify({oldRendererRejected:true,failure},null,2)+'\n');
console.log('PASS: square-ended baseline rejected:',failure);
