import {readFile} from 'node:fs/promises';
import {buildAsylumLayout} from '../../dist/asylum-layout.mjs';
const url=new URL('../../dist/asylum-furniture.mjs',import.meta.url);
let source=await readFile(url,'utf8');
source=source.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,url).href}'`);
const start=source.indexOf('function clearPlacement('),end=source.indexOf('function wallCandidates(',start);let index=0;
source=source.slice(0,start)+source.slice(start,end).replaceAll('return false;',()=>`{if(room.id==='B5')rejected.push({x:item.x,z:item.z,rotation:item.rotation,rule:${++index}});return false;}`)+source.slice(end)+'\nexport const rejected=[];';
const m=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)))).floors;
try{m.furnishAsylum(floors);}catch(e){console.log(e.message);}
console.log(m.rejected.reduce((sum,r)=>(sum[r.rule]=(sum[r.rule]??0)+1,sum),{}));
for(let rule=1;rule<=index;rule++)console.log(rule,m.rejected.filter(r=>r.rule===rule).slice(0,3));
