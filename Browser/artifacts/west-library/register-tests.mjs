import {readFile,writeFile} from 'node:fs/promises';
const url=new URL('../../package.json',import.meta.url),pkg=JSON.parse(await readFile(url));
for(const script of ['test','test:asylum'])if(!pkg.scripts[script].includes('node test-west-library.mjs'))pkg.scripts[script]=pkg.scripts[script].replace('node test-reception-second-floor.mjs','node test-reception-second-floor.mjs && node test-west-library.mjs');
if(!pkg.scripts['test:asylum'].includes('node test-west-library-browser.mjs'))pkg.scripts['test:asylum']+=' && node test-west-library-browser.mjs';
pkg.scripts['test:west-library']='node test-west-library.mjs && node test-west-library-browser.mjs';
await writeFile(url,JSON.stringify(pkg,null,2)+'\n');
