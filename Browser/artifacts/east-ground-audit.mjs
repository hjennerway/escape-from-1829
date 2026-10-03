import {readFile} from 'node:fs/promises';
import {buildAsylumLayout} from '../dist/asylum-layout.mjs';
const plan=JSON.parse(await readFile(new URL('../dist/asylum-plan.json',import.meta.url)));
const floor=buildAsylumLayout(plan).floors[0];
console.log(JSON.stringify({walls:floor.walls.filter(w=>[w.a,w.b].some(([x,z])=>x>=30&&x<=41&&z>=18&&z<=30)),doorways:floor.doorways.filter(d=>d.x>=30&&d.x<=41&&d.z>=18&&d.z<=30)},null,2));
