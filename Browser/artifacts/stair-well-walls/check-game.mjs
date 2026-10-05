import {readFile} from 'node:fs/promises';

// Run the existing furnished-game check with a fresh artifact directory; older
// captures can be locked by a desktop preview on Windows.
const test=new URL('../../test-asylum-browser.mjs',import.meta.url);
const source=(await readFile(test,'utf8'))
 .replace("'./artifacts/asylum-remodel/'","'./artifacts/stair-well-walls/game/'")
 .replace("page.on('pageerror',e=>errors.push(e.message));","page.on('pageerror',e=>{errors.push(e.message);console.log('Game page error: '+e.message);});")
 .replace("await page.waitForFunction(()=>window.asylumTest?.ready,null,{timeout:120000});","await page.waitForFunction(()=>window.asylumTest?.ready,null,{timeout:120000}).catch(async error=>{console.log(JSON.stringify({errors,state:await page.evaluate(()=>({title:document.title,loading:document.querySelector('#loading')?.textContent,test:!!window.asylumTest}))}));throw error;});")
 .replace(/from '(\.[^']+)'/g,(_,path)=>`from '${new URL(path,test).href}'`)
 .replaceAll('import.meta.url',JSON.stringify(test.href));
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
