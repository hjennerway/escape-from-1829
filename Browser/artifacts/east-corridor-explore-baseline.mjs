import {readFile} from 'node:fs/promises';
const test=new URL('../test-explore-interior.mjs',import.meta.url);
const plan=JSON.parse(await readFile(new URL('../dist/asylum-plan.json',import.meta.url)));
const before=JSON.parse(await readFile(new URL('./east-corridor/asylum-plan-before.json',import.meta.url)));
const r36=plan.rooms.find(r=>r.id==='R36');delete r36.variants[0];
plan.corridors.find(c=>c.id==='C6').variants[0]=before.corridors.find(c=>c.id==='C6').variants[0];
const loop=plan.floors[0].outline.loops[0],index=loop.findIndex(([x,z])=>x===30.25&&z===27);
loop.splice(index,2,[32,27]);plan.floors[0].outline.area-=1.75*1.75/2;
const code=(await readFile(test,'utf8')).replace(/const plan=JSON.parse\(await readFile\(new URL\('\.\/dist\/asylum-plan.json',import.meta.url\)\)\);/,`const plan=${JSON.stringify(plan)};`).replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,test).href}'`);
try{await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));}
catch(error){console.error(`${error.name}: ${error.message}`);process.exitCode=1;}
