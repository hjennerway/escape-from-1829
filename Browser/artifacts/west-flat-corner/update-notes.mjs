import {readFile,writeFile} from 'node:fs/promises';
const path=new URL('../../../Research/west/README.md',import.meta.url),bytes=await readFile(path);
const marker=[Buffer.from('# West wing refinement\r\n\r\n'),Buffer.from('# West wing refinement\n\n')].find(b=>bytes.includes(b)),index=marker?bytes.indexOf(marker):-1;
if(index<0)throw Error('West research header not found');
const note=Buffer.from('## Inside-corner wall extension and flat roof (4 October 2026)\r\n\r\nThe latest [yellow-line correction](flat-corner-2026-10-04/README.md) adds a\r\nlower stepped brick section between the garden pavilion and forward wing,\r\nwith a level roof. It supersedes the open lower strip from the previous\r\nroof/face alignment; the aligned upper back wall remains.\r\n\r\n');
if(!bytes.includes(Buffer.from('flat-corner-2026-10-04/README.md')))await writeFile(path,Buffer.concat([bytes.subarray(0,index+marker.length),note,bytes.subarray(index+marker.length)]));
