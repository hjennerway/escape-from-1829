// Owner-approved fictional uses for three open halls. Architecture is retained.
export const HALL_PROP_CATALOG={
 sideboard:{procedural:true,width:2.10,depth:.55,height:1.05},
 landscape:{procedural:true,width:1.32,depth:.065,height:.86,decorative:true,mounted:true},
 visitingNotice:{procedural:true,width:.70,depth:.055,height:.90,decorative:true,mounted:true},
 linenCupboard:{procedural:true,width:1.55,depth:.60,height:2.25},
 linenTrolley:{procedural:true,width:1.40,depth:.72,height:1.10},
 dutyBoard:{procedural:true,width:1.05,depth:.06,height:.76,decorative:true,mounted:true},
 draughtsSet:{procedural:true,width:.66,depth:.66,height:.045,decorative:true},
 newspaperStand:{procedural:true,width:.72,depth:.46,height:1.16},
 sewingBasket:{procedural:true,width:.48,depth:.34,height:.29,decorative:true}
};
const eastPoints=[[25,9.4],[34.3,9.4],[34.3,15.5],[30.8,15.5],[29.1,17.2],[29.1,19.7],[25,19.7]];
export function hallFurnishings(floor,catalog){
 const areas=[],items=[];
 function area(id,name,purpose,label,points){const a={id,name,purpose,label,points};areas.push(a);return a;}
 function put(a,kind,x,z,rotation=0,options={}){
  const item={...catalog[kind],id:`${floor.id}:${a.id}:fixed:${items.filter(i=>i.roomId===a.id).length}`,kind,roomId:a.id,variable:false,x,z,rotation,y:.008,...options};
  items.push(item);return item;
 }
 function on(a,kind,support,u=0,v=0){const c=Math.cos(support.rotation),s=Math.sin(support.rotation);return put(a,kind,support.x+c*u+s*v,support.z-s*u+c*v,support.rotation,{y:support.y+support.height+.008,supportId:support.id});}
 if(floor.id===1){
  const a=area('Visitors','Visitors’ sitting hall','visitors',[0,17.4],[[-7.1,9.4],[7.1,9.4],[7.1,19.6],[-7.1,19.6]]);
  for(const x of [-3.6,3.6]){
   const t=put(a,'table',x,13.1,0,{width:1.56,depth:.8528,height:.7904});
   for(const [dx,dz,r] of [[-1.40,0,Math.PI/2],[1.40,0,-Math.PI/2],[0,-1.25,0],[0,1.25,Math.PI]])put(a,'chair',x+dx,t.z+dz,r);
   on(a,'books',t,0,0);
  }
  put(a,'sideboard',7.01-catalog.sideboard.depth/2,16.0,-Math.PI/2);
  put(a,'landscape',7.01-catalog.landscape.depth/2,16.0,-Math.PI/2,{y:1.62});
  put(a,'landscape',-7.01+catalog.landscape.depth/2,13.1,Math.PI/2,{y:1.74});
  put(a,'visitingNotice',-7.01+catalog.visitingNotice.depth/2,16.0,Math.PI/2,{y:1.40});
 }
 if(floor.id===0){
  const a=area('WardService','Ward service lobby','wardService',[29.0,10.2],eastPoints);
  for(const z of [11.2,13.4])put(a,'linenCupboard',25.09+catalog.linenCupboard.depth/2,z,Math.PI/2);
  put(a,'linenTrolley',28.1,12.5,0);
  put(a,'waitingBench',25.09+catalog.waitingBench.depth*.75/2,16.0,Math.PI/2,{width:catalog.waitingBench.width*.75,depth:catalog.waitingBench.depth*.75,height:catalog.waitingBench.height*.75});
  put(a,'dutyBoard',25.09+catalog.dutyBoard.depth/2,16.0,Math.PI/2,{y:1.45});
 }
 if(floor.id===1){
  const a=area('Recreation','Communal recreation area','recreation',[30.0,10.2],eastPoints);
  const table=put(a,'table',28.0,12.8,Math.PI/2);
  for(const [dx,dz,r] of [[-1.18,-.48,Math.PI/2],[-1.18,.48,Math.PI/2],[1.18,-.48,-Math.PI/2],[1.18,.48,-Math.PI/2]])put(a,'chair',table.x+dx,table.z+dz,r);
  on(a,'draughtsSet',table,0,0);
  const side=put(a,'sideboard',25.09+catalog.sideboard.depth/2,16.0,Math.PI/2);
  on(a,'sewingBasket',side,-.42,0);
  on(a,'books',side,.40,0);
  put(a,'newspaperStand',32.7,11.2,0);
  put(a,'waitingBench',26.5,18.0,0,{width:catalog.waitingBench.width*.75,depth:catalog.waitingBench.depth*.75,height:catalog.waitingBench.height*.75});
 }
 return {areas,items};
}
