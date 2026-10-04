import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('../../../Research/west/README.md',import.meta.url),original=readFileSync(file);
const note=Buffer.from('\n## Inside-corner roof and face alignment (4 October 2026)\n\nThe later [purple roof/face and yellow wall correction](roof-face-2026-10-04/README.md)\nremoves the low roof shoulder and recesses the short exposed face from z=17\nto the yellow wall\'s z=15.5 plane. It supersedes the low east shoulder and\nits former west inside-corner returns.\n');
if(!original.includes(note)){const offset=original.indexOf(10)+1;writeFileSync(file,Buffer.concat([original.subarray(0,offset),note,original.subarray(offset)]));}
