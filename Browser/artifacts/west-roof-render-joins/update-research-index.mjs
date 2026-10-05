import {readFile,writeFile} from 'node:fs/promises';
const path=new URL('../../../Research/west/README.md',import.meta.url),bytes=await readFile(path);
const marker=Buffer.from('# West wing refinement'),offset=bytes.indexOf(marker);
const note='## Descending roof edges and render returns (5 October 2026)\r\n\r\nThe latest [blue/purple corner corrections](roof-render-joins-2026-10-05/README.md)\r\nalign both outer-pavilion descending roof edges with the tall cornices and\r\njoin them to the lower eaves with solid white render. They supersede the\r\nshort slate wedges and projecting white end caps in the earlier eave repair.\r\nSlate meets the render boundary and must never cut through its middle.\r\n\r\n';
if(offset<0)throw Error('Missing research heading');
if(!bytes.includes(Buffer.from('## Descending roof edges and render returns'))){
 let end=offset+marker.length;while(bytes[end]===10||bytes[end]===13)end++;
 await writeFile(path,Buffer.concat([bytes.subarray(0,end),Buffer.from(note),bytes.subarray(end)]));
}
