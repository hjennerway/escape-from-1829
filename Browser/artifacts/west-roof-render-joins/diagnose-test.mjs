import {readFile} from 'node:fs/promises';
const url=new URL('../../test-west-roof-join.mjs',import.meta.url);
let source=await readFile(url,'utf8');
source=source.replaceAll("'./dist/","'"+new URL('../../dist/',import.meta.url).href);
for(const text of ['const lowBay=','// These are','// Independent','// Valleys','// Raised corners','// The later blue','const viewCamera=','for(const [x,y]','for(let z=12.05','for(let x=-26.8','assert(top(-27.3,19.5)'])source=source.replace(text,'console.log('+JSON.stringify(text)+');\n'+text);
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
