import fs from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
const readFile=fs.readFile.bind(fs);
const url=new URL('../../dist/asylum-plan.json',import.meta.url);
const plan=JSON.parse(await readFile(url,'utf8'));
for(const id of ['R27','R22','R4'])delete plan.rooms.find(r=>r.id===id).variants[0];
const outline=plan.floors[0].outline,loop=outline.loops[0],corner=loop.findIndex(p=>p[0]===43.35&&p[1]===7);
if(corner<0)throw new Error('Expected repaired outline corner');
loop.splice(corner,2,[45.1,7]);outline.area-=1.75*1.75/2;
const bytes=Buffer.from(JSON.stringify(plan));
fs.readFile=async(path,options)=>{
 if(String(path).replaceAll('\\','/').endsWith('/asylum-plan.json'))return typeof options==='string'||options?.encoding?bytes.toString():bytes;
 return readFile(path,options);
};
syncBuiltinESMExports();
