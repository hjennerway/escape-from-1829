import {readFile} from 'node:fs/promises';
import {buildAsylumLayout,flatWalkable} from '../../dist/asylum-layout.mjs';
import {makeFloors,routeBetweenFloors} from '../../dist/floors.mjs';
const old=makeFloors(buildAsylumLayout(JSON.parse(await readFile(new URL('./plan-before.json',import.meta.url))))),current=makeFloors(buildAsylumLayout(JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)))));
for(const id of ['R17','R18']){
 const r=old[0].rooms.find(r=>r.id===id),route=routeBetweenFloors(old,{x:0,z:14,floor:0},{x:r.label[0],z:r.label[1],floor:0});
 console.log(id,JSON.stringify(route.filter(p=>p.x<-62).map(p=>({...p,clear:flatWalkable(current[p.floor],p.x,p.z)}))));
}
