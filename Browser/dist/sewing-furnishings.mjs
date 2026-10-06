// Owner-directed hand-sewing room. Reuse the shared timber and cloth models.
export function sewingFurnishings(floor,room,catalog){
 const items=[];
 function put(kind,x,z,rotation=0,options={}){
  const item={...catalog[kind],id:`${floor.id}:${room.id}:fixed:${items.length}`,kind,roomId:room.id,variable:false,x,z,rotation,y:.008,...options};
  items.push(item);return item;
 }
 function on(kind,support,u=0){
  return put(kind,support.x+Math.cos(support.rotation)*u,support.z-Math.sin(support.rotation)*u,support.rotation,{y:support.y+support.height+.008,supportId:support.id});
 }
 for(const z of [10.5,16.3]){
  const table=put('table',-61.7,z);
  put('chair',table.x,z-1.15,0);
  put('chair',table.x,z+1.15,Math.PI);
  on('foldedLinen',table,-.45);
  on('sewingBasket',table,.55);
 }
 put('cupboard',-56.75,19.085,Math.PI);
 return items;
}
