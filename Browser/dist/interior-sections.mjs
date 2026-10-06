// Ten render sections. All navigation/door/NPC state continues to use the complete plan.
// Ground/first floors have a central stair/reception section and two wings;
// basement/top floor have two wings. Cuts use existing transverse door planes.
export const INTERIOR_SECTION_FORMAT=1;
export function interiorSections(floors){
 return floors.flatMap(floor=>{
  const three=floor.id===0||floor.id===1,desired=three?[-34.5,34.5]:[floor.id===2?-32.3:-55.6];
  const doors=floor.doorways.filter(d=>Math.abs(d.dx)<.01);
  const cuts=desired.map(x=>{const nearby=doors.filter(d=>Math.abs(d.x-x)<3).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x));return nearby[0]?.x??x;});
  const limits=[-Infinity,...cuts,Infinity],names=three?['west','central','east']:['west','east'];
  return names.map((wing,i)=>({id:floor.id+'-'+wing,floor:floor.id,wing,minX:limits[i],maxX:limits[i+1],name:floor.name+' · '+wing}));
 });
}
export function sectionAt(sections,actor){return sections.find(s=>s.floor===actor.floor&&actor.x>=s.minX&&actor.x<s.maxX);}
export function sectionDistance(section,actor){return Math.hypot(Math.max(section.minX-actor.x,0,actor.x-section.maxX),section.floor===actor.floor?0:35);}
