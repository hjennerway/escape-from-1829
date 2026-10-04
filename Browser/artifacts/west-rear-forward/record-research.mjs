import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('../../../Research/west/README.md',import.meta.url),bytes=readFileSync(file);
const note=Buffer.from('## Stepped rear-court corner moved forward (4 October 2026)\r\n\r\nThe latest [purple/blue edge and red-face correction](rear-forward-2026-10-04/README.md)\r\nextends the outer rear corner and its adjoining recessed face four units\r\ntowards the court. It supersedes those two rear limits in the earlier\r\nend-depth correction; the garden-side limits retain their positions.\r\n\r\n');
if(!bytes.includes(Buffer.from('rear-forward-2026-10-04/README.md'))){
 const at=bytes.indexOf(Buffer.from('## Inside-corner roof'));
 if(at<0)throw Error('Missing research insertion point');
 writeFileSync(file,Buffer.concat([bytes.subarray(0,at),note,bytes.subarray(at)]));
}
