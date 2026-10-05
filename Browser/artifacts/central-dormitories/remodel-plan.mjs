import {readFile,writeFile} from 'node:fs/promises';

// One-off owner-directed plan revision; retain the ground-floor room records.
const file=new URL('../../dist/asylum-plan.json',import.meta.url);
const plan=JSON.parse(await readFile(file));
const revisions=[
 {id:'R6',merged:'R7',points:[[-6.5,-39.5],[5.5,-39.5],[5.5,-25.9],[4.1,-24.5],[-6.5,-24.5]],door:-35.5,label:[-1.1,-32],rowEnd:-25.9,east:5.5},
 {id:'R8',merged:'R9',points:[[-6.5,-24.5],[4.1,-24.5],[4.1,-9],[-6.5,-9]],door:-20.75,label:[-1.8,-16.75],rowEnd:-9,east:4.1},
 {id:'R10',merged:'R11',points:[[-6.5,-9],[4.1,-9],[4.1,5.1],[3.9,4.9],[-6.5,4.9]],door:-5,label:[-1.8,-2.05],rowEnd:4.9,east:4.1,corridorClipping:false}
];
for(const {id,merged,points,door,label,rowEnd,east,corridorClipping} of revisions){
 const room=plan.rooms.find(r=>r.id===id);
 room.variants??={};
 room.variants[1]={name:'Central dormitory · 16 beds',points,door,label,
  description:`First-floor dormitory combining ${id} and ${merged}; eight beds along each long wall, with clear window and entrance access.`,
  bedRows:[
   {wall:[[-6.5,points[0][1]],[-6.5,rowEnd]],count:8,clearance:.95,endClearance:id==='R10'?[.85,1.3]:.90},
   {wall:[[east,points[0][1]],[east,rowEnd]],count:8,clearance:2.15,endClearance:id==='R10'?[.85,1.3]:.90}
  ],...(corridorClipping===false?{corridorClipping}: {})};
 const old=plan.rooms.find(r=>r.id===merged);
 old.floors=old.floors.filter(f=>f!==1);
 if(old.variants)delete old.variants[1];
}
const json=JSON.stringify(plan,null,2)+'\n';
await writeFile(file,json);
await writeFile(new URL('../../../Research/1829-interior-proposal/plan-data.json',import.meta.url),json);
