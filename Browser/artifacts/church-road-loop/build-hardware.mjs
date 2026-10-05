import {readFile,writeFile,unlink} from 'node:fs/promises';
const root=new URL('../../',import.meta.url),temporary=new URL('.church-road-build-hardware.mjs',root);
const source=(await readFile(new URL('build-models.mjs',root),'utf8'))
 .replace("import {chromium} from 'playwright';","import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';")
 .replace('chromium.launch(', 'launchHardwareBrowser(');
try{await writeFile(temporary,source);await import(temporary.href);}finally{await unlink(temporary).catch(()=>{});}
