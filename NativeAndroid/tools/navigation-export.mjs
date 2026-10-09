// Serialize the reviewed browser plan into JsonUtility-compatible records.
// Coordinates stay in browser space; the Unity renderer reflects Z once.
export const point = ([x,z]) => ({x,z});
export const point3 = ([x,y,z]) => ({x,y,z});
export function exportNavigation(floors, stairRoute, stairDeparture, {roomNumbers,displayName}) {
  const flights=[];
  for(const stair of floors[0].stairs) for(const [lower,upper] of stair.connections)
    {const route=stairRoute(stair,floors[lower].elevation,floors[upper].elevation,lower,upper);
    flights.push({id:stair.id,lower,upper,route:route.map(point3),lowerDeparture:stairDeparture(floors[lower],route[0]),upperDeparture:stairDeparture(floors[upper],route.at(-1))});}
  return {flights,floors:floors.map(f=>({
    id:f.id,name:f.name,elevation:f.elevation,cellSize:f.cellSize,width:f.width,height:f.height,
    origin:f.origin,cells:Array.from(f.cells),spawn:f.spawn,patrol:f.patrol,enemies:f.enemies,
    bounds:f.bounds,loops:f.outline.loops.map(points=>({points:points.map(point)})),
    furniture:(f.furnitureObstacles??[]).map(i=>({x:i.x,y:i.y,z:i.z,width:i.width,depth:i.depth,height:i.height,rotation:i.rotation})),
    roomDoors:(f.roomDoors??[]).map(i=>({x:i.x,z:i.z,width:i.width,depth:i.depth,height:i.height,rotation:i.rotation})),
    walls:f.walls.map(w=>({a:point(w.a),b:point(w.b)})),shafts:f.shafts,
    rails:f.stairRails.map(points=>({points:points.map(([x,y,z])=>({x,y:y+f.elevation,z}))})),
    doorways:f.doorways,exitHeaders:f.exitHeaders.map(w=>({...w,a:point(w.a),b:point(w.b)})),
    rooms:f.rooms.map(r=>({id:r.id,number:roomNumbers(f).get(r.id)??'',name:displayName(r.name),points:r.points.map(point),label:point(r.label)})),
    corridors:f.corridors.map(c=>({...c,name:displayName(c.name),points:c.points.map(point)})),
    stairs:f.stairs.map(s=>({id:s.id,name:displayName(s.name),x:s.x,z:s.z,points:s.points.map(point)})),
    exits:f.exits.map(e=>({...e,destination:point3(e.destination)})),safeSpawns:f.safeSpawns,
    lamps:[...f.rooms.map(r=>point(r.label)),...f.stairs.map(s=>point(s.label)),...f.corridors.flatMap(c=>c.points.slice(1).flatMap((b,i)=>{
      const a=c.points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));
      return Array.from({length:n},(_,k)=>({x:a[0]+(b[0]-a[0])*(k+.5)/n,z:a[1]+(b[1]-a[1])*(k+.5)/n}));
    }))]
  }))};
}

export function exportOutside(THREE,exterior,obstaclesFor) {
  // Rendering batches span disconnected walls, stairs and open courtyards.
  // Match createAsylumOutside.refresh: inspect the retained source meshes,
  // then restore exactly the visibility used by the geometry exporter.
  const visibility=[];
  exterior.model.traverse(o=>{if(o.userData.aerialBatch||o.userData.aerialBatchSource){visibility.push([o,o.visible]);o.visible=!!o.userData.aerialBatchSource;}});
  try {
  const obstacles=obstaclesFor(THREE,exterior.model,{preciseFootprints:true});
  const serialize=b=>({...b,minY:Number.isFinite(b.minY)?b.minY:-10000,maxY:Number.isFinite(b.maxY)?b.maxY:10000,
    ...(b.corners?{corners:b.corners.map(point)}:{})});
  const supports=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
  const masonry=[];
  exterior.model.getObjectByName('West forward end masonry return stair')?.traverse(o=>{if(o.isMesh)masonry.push(new THREE.Box3().setFromObject(o));});
  const walls=obstacles.filter(b=>!masonry.some(c=>Math.abs(c.min.x-b.minX)<.02&&Math.abs(c.max.x-b.maxX)<.02&&Math.abs(c.min.z-b.minZ)<.02&&Math.abs(c.max.z-b.maxZ)<.02));
  function remember(o,transform){
    const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const local=g.boundingBox,b=local.clone().applyMatrix4(transform);
    const solid=/\b(?:tread|step|landing)\b/i.test(o.name)&&!/rail|parapet|cheek|coping|riser/i.test(o.name);
    if(g.type!=='BoxGeometry'||(!solid&&b.max.y-b.min.y>.35)||b.max.x-b.min.x<.18||b.max.z-b.min.z<.18)return;
    const corners=[[local.min.x,local.min.z],[local.max.x,local.min.z],[local.max.x,local.max.z],[local.min.x,local.max.z]].map(([x,z])=>{const p=new THREE.Vector3(x,local.max.y,z).applyMatrix4(transform);return {x:p.x,z:p.z};});
    supports.push({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,height:b.max.y,corners});
  }
  exterior.model.traverseVisible(o=>{if(!o.isMesh||o.userData.noWalkingCollision)return;if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);remember(o,world);}else remember(o,o.matrixWorld);});
  return {obstacles:walls.map(serialize),jumpObstacles:obstacles.jumpObstacles,supports,walkSurfaces:obstacles.walkSurfaces.map(serialize)};
  } finally {for(const [o,visible] of visibility)o.visible=visible;}
}
