import {readFile,writeFile} from 'node:fs/promises';
import {buildAsylumLayout} from '../../dist/asylum-layout.mjs';
import {furnishAsylum} from '../../dist/asylum-furniture.mjs';
const before=JSON.parse(await readFile(new URL('before.json',import.meta.url))),floors=buildAsylumLayout(JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)))).floors;
furnishAsylum(floors);
await writeFile(new URL('after.json',import.meta.url),JSON.stringify(floors.map(f=>({id:f.id,furniture:f.furniture})),null,2)+'\n');
console.log(JSON.stringify(floors.map(f=>{const old=before.find(p=>p.id===f.id).furniture.filter(i=>['bookcase','apothecary'].includes(i.kind)),current=f.furniture.filter(i=>['bookcase','apothecary'].includes(i.kind));return {floor:f.id,before:old.length,after:current.length,missing:old.filter(i=>!current.some(p=>p.id===i.id)).map(i=>i.id),moved:current.filter(i=>{const p=old.find(p=>p.id===i.id);return p&&(p.x!==i.x||p.z!==i.z||p.rotation!==i.rotation);}).map(i=>i.id)};})));
