import {readFile,writeFile} from 'node:fs/promises';
const game=new URL('../../dist/asylum-plan.json',import.meta.url),review=new URL('../../../Research/1829-interior-proposal/plan-data.json',import.meta.url);
const before=await readFile(game,'utf8');
if(before!==await readFile(review,'utf8'))throw Error('Shared plans differ before repair');
const plan=JSON.parse(before);
for(const id of ['R5','R16'])for(const floor of [0,1]){
 const room=plan.rooms.find(r=>r.id===id);
 room.variants??={};room.variants[floor]??={};
 room.variants[floor].solidEdges=[...new Set([...(room.variants[floor].solidEdges??room.solidEdges??[]),2])];
}
const after=JSON.stringify(plan)+'\n';
await writeFile(game,after);await writeFile(review,after);
console.log('Updated both rear room boundaries on ground and first floors in both shared plans.');
