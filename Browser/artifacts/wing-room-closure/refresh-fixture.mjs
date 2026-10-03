import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {buildAsylumLayout,flatWalkable,segmentDistance} from '../../dist/asylum-layout.mjs';
const file=new URL('../../fixtures/asylum-wall-joins.json',import.meta.url),fixtures=JSON.parse(await readFile(file)),plan=JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url))),old=JSON.parse(await readFile(new URL('./plan-before.json',import.meta.url))),floors=buildAsylumLayout(plan).floors,removed=[];
for(const fixture of fixtures)fixture.gaps=fixture.gaps.filter(gap=>{
 const probes=[.2,.5,.8].map(t=>gap.from.map((n,i)=>n+(gap.to[i]-n)*t));
 if(probes.every(p=>!flatWalkable(floors[fixture.floor],...p,.01)))return true;
 const moved=old.rooms.filter(r=>r.floors.includes(fixture.floor)&&JSON.stringify({...r,...r.variants?.[fixture.floor]})!==JSON.stringify({...plan.rooms.find(v=>v.id===r.id),...plan.rooms.find(v=>v.id===r.id).variants?.[fixture.floor]}));
 assert(probes.some(p=>moved.some(r=>{
  const points=r.variants?.[fixture.floor]?.points??r.points;
  return points.some((a,i)=>segmentDistance(...p,a,points[(i+1)%points.length])<.31);
 })),'Only probes of replaced room boundaries may be retired');
 removed.push({floor:fixture.floor,...gap});return false;
});
await writeFile(new URL('./retired-join-probes.json',import.meta.url),JSON.stringify(removed,null,2)+'\n');
await writeFile(file,'[\n'+fixtures.map(f=>'  {"floor":'+f.floor+',"gaps":[\n'+f.gaps.map(g=>'    '+JSON.stringify(g)).join(',\n')+'\n  ]}').join(',\n')+'\n]\n');
const pkgFile=new URL('../../package.json',import.meta.url),pkg=JSON.parse(await readFile(pkgFile));
for(const name of ['test','test:asylum'])if(!pkg.scripts[name].includes('test-asylum-room-closures.mjs'))pkg.scripts[name]=pkg.scripts[name].replace('node test-asylum-layout.mjs','node test-asylum-layout.mjs && node test-asylum-room-closures.mjs');
await writeFile(pkgFile,JSON.stringify(pkg,null,2)+'\n');
console.log(JSON.stringify({retiredProbes:removed,remaining:fixtures.reduce((n,f)=>n+f.gaps.length,0)}));
