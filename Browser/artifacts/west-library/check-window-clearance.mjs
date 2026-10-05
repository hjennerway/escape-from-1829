import {readFile} from 'node:fs/promises';
const url=new URL('../../test-asylum-window-clearance.mjs',import.meta.url);
// Use the unchanged audit with a fresh report location: Windows holds the
// shared clearance.json open after the broader suite writes that artifact.
let source=await readFile(url,'utf8');
source=source.replace("new URL('./artifacts/window-clearance/',import.meta.url)",`new URL(${JSON.stringify(new URL('./window-clearance-final/',import.meta.url).href)})`);
source=source.replaceAll('import.meta.url',JSON.stringify(url.href)).replace(/from '(\.[^']+)'/g,(_,p)=>`from '${new URL(p,url).href}'`);
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
