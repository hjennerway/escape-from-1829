// Join sampled road edges at their offset-line intersections. Small bends
// share exact cross-sections; sharp turns and closed ends get smooth round
// joins. The authored centreline remains the placement reference.
export function roadRibbonPolygons(input,width,{openStart=false,openEnd=false,tolerance=.005}={}){
 const points=input.filter((p,i)=>!i||Math.hypot(p[0]-input[i-1][0],p[1]-input[i-1][1])>1e-8);
 if(points.length<2)return [];
 const closed=Math.hypot(points[0][0]-points.at(-1)[0],points[0][1]-points.at(-1)[1])<1e-8;
 const half=width/2,normals=[],stations=[],polygons=[];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  normals.push([-dz/length,dx/length]);
 }
 for(let i=0;i<points.length;i++){
  const incoming=normals[i?i-1:closed?normals.length-1:0];
  const outgoing=normals[i<normals.length?i:closed?0:normals.length-1];
  const dot=incoming[0]*outgoing[0]+incoming[1]*outgoing[1];
  const round=dot<Math.cos(Math.PI/12);
  const offset=round?null:incoming.map((v,k)=>(v+outgoing[k])*half/(1+dot));
  stations.push({incoming,outgoing,offset,round});
 }
 const pair=(i,normal)=>[-1,1].map(side=>points[i].map((v,k)=>v+(stations[i].offset?.[k]??normal[k]*half)*side));
 for(let i=1;i<points.length;i++){
  const [a,b]=pair(i-1,normals[i-1]),[c,d]=pair(i,normals[i-1]);
  polygons.push([a,b,d,c]);
 }
 const steps=Math.max(24,Math.ceil(Math.PI/Math.acos(1-Math.min(tolerance/half,1))));
 function disk(i){
  const angles=Array.from({length:steps},(_,j)=>j/steps*Math.PI*2);
  // Include exact strip tangencies so round joins never leave small teeth.
  for(const normal of [stations[i].incoming,stations[i].outgoing])for(const side of [-1,1])angles.push((Math.atan2(normal[1]*side,normal[0]*side)+Math.PI*2)%(Math.PI*2));
  angles.sort((a,b)=>a-b);
  polygons.push(angles.filter((a,j)=>!j||a-angles[j-1]>1e-8).map(a=>[points[i][0]+Math.cos(a)*half,points[i][1]+Math.sin(a)*half]));
 }
 for(let i=0;i<points.length-(closed?1:0);i++){
  if(stations[i].round||(!closed&&((i===0&&!openStart)||(i===points.length-1&&!openEnd))))disk(i);
 }
 return polygons;
}

export function createRoadRibbonGeometry(THREE,points,width,y,ends={}){
 const positions=[],uv=[],indices=[];
 for(const polygon of roadRibbonPolygons(points,width,ends)){
  const first=positions.length/3;
  for(const [x,z] of polygon){positions.push(x,y,z);uv.push(x/3,-z/3);}
  // Each piece is convex. Keep upward winding even at a tight inside bend.
  for(let i=1;i<polygon.length-1;i++){
   const a=polygon[0],b=polygon[i],c=polygon[i+1];
   const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
   if(Math.abs(area)<1e-10)continue;
   indices.push(first,first+(area<0?i:i+1),first+(area<0?i+1:i));
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 // Open mouths continue into a sloping fade. Ground-contact closure must not
 // build a vertical retaining face across that shared cross-section.
 geometry.userData.openGroundEdges=[];
 for(const [open,a,b] of [[ends.openStart,points[0],points[1]],[ends.openEnd,points.at(-1),points.at(-2)]]){
  if(!open)continue;
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  geometry.userData.openGroundEdges.push([a[0],a[1],(b[0]-a[0])/length,(b[1]-a[1])/length]);
 }
 return geometry;
}
