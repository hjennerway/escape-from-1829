import {applyFurnitureFinish} from './furniture-finishes.mjs';
import {ROOM_USES} from './asylum-room-uses.mjs';
import {doorRectangle,roomDoorHandle} from './asylum-doors.mjs';

export const CELL_PAD_WIDTH=.62,CELL_PAD_HEIGHT=.58,CELL_PAD_DEPTH=.045;
const materials=new WeakMap();
export function cellPaddingMaterial(THREE){
 if(!materials.has(THREE)){
  const material=applyFurnitureFinish(THREE,new THREE.MeshStandardMaterial({color:0xb9af98,roughness:1}),{kind:'matte',cacheKey:'cell-canvas'});
  material.name='Worn padded-cell canvas';materials.set(THREE,material);
 }
 return materials.get(THREE);
}
// Clip against the actual exposed masonry, including its apertures. The same
// quilt coordinates continue through the lower/upper masonry batch boundary.
function clip(poly,axis,limit,above){
 const output=[],dot=p=>p[0]*axis[0]+p[1]*axis[1]+p[2]*axis[2];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],av=dot(a),bv=dot(b),ai=above?av>=limit:av<=limit,bi=above?bv>=limit:bv<=limit;
  if(ai)output.push(a);
  if(ai!==bi){const t=(limit-av)/(bv-av);output.push(a.map((v,j)=>v+(b[j]-v)*t));}
 }
 return output;
}
function rectangle(poly,u,v,left,right,bottom,top){
 return clip(clip(clip(clip(poly,u,left,true),u,right,false),v,bottom,true),v,top,false);
}
function exclude(poly,u,v,[left,right,bottom,top]){
 // Four disjoint strips retain everything outside a casing/parked leaf.
 const middle=clip(clip(poly,u,left,true),u,right,false);
 return [clip(poly,u,left,false),clip(poly,u,right,true),clip(middle,v,bottom,false),clip(middle,v,top,true)].filter(p=>p.length>=3);
}
export function createCellPadding(THREE,floor,ceilingHeight,windowFrames=[]){
 const positions=[],normals=[],uvs=[],rooms=new Set();let surfaces=0;
 const dot=(p,a)=>p.reduce((sum,x,i)=>sum+x*a[i],0);
 function surface(polygon,normal,roomId,horizontal=false){
  const u=horizontal?[1,0,0]:[normal[2],0,-normal[0]],v=horizontal?[0,0,1]:[0,1,0];
  const width=CELL_PAD_WIDTH,height=CELL_PAD_HEIGHT,depth=horizontal?.012:CELL_PAD_DEPTH;
  let polygons=[polygon];
  if(!horizontal){
   polygons=[clip(clip(polygon,v,.008,true),v,ceilingHeight,false)];
   const line=dot(polygon[0],normal),exclusions=[];
   for(const w of windowFrames){
    if(Math.abs(w.x*normal[0]+w.z*normal[2]-line)>w.depth/2+depth+.02)continue;
    const centre=w.x*u[0]+w.z*u[2],span=(Math.abs(w.dx*u[0]+w.dz*u[2])*w.width+Math.abs(-w.dz*u[0]+w.dx*u[2])*w.depth)/2+.015;
    exclusions.push([centre-span,centre+span,w.bottom-.015,w.top+.015]);
   }
   for(const d of floor.doorways){
    if(Math.abs(d.x*normal[0]+d.z*normal[2]-line)>d.depth/2+.12)continue;
    if(Math.abs(d.dx*u[0]+d.dz*u[2])<.99)continue;
    const centre=d.x*u[0]+d.z*u[2];exclusions.push([centre-d.width/2-.11,centre+d.width/2+.11,0,d.height+.10]);
   }
   // A door resting against its wall must also clear the soft lining.
   for(const door of floor.roomDoors??[]){
    if(door.roomId!==roomId)continue;
    const points=[...doorRectangle(door),...doorRectangle(roomDoorHandle(door))];
    if(Math.min(...points.map(p=>Math.abs(p[0]*normal[0]+p[1]*normal[2]-line)))>depth+.02)continue;
    const values=points.map(p=>p[0]*u[0]+p[1]*u[2]);exclusions.push([Math.min(...values)-.02,Math.max(...values)+.02,0,door.y+door.height+.025]);
   }
   for(const box of exclusions)polygons=polygons.flatMap(p=>exclude(p,u,v,box));
  }
  for(const poly of polygons){
   if(poly.length<3)continue;
   const us=poly.map(p=>dot(p,u)),vs=poly.map(p=>dot(p,v)),stepU=width/6,stepV=height/6;
   for(let x=Math.floor(Math.min(...us)/stepU);x<Math.ceil(Math.max(...us)/stepU);x++)for(let y=Math.floor(Math.min(...vs)/stepV);y<Math.ceil(Math.max(...vs)/stepV);y++){
    const patch=rectangle(poly,u,v,x*stepU,(x+1)*stepU,y*stepV,(y+1)*stepV);if(patch.length<3)continue;
    const vertices=patch.map(p=>{
     const a=dot(p,u)/width,b=dot(p,v)/height,s=Math.sin(Math.PI*a),t=Math.sin(Math.PI*b);
     const lift=.004+depth*s*s*t*t,du=depth*Math.PI/width*Math.sin(2*Math.PI*a)*t*t,dv=depth*Math.PI/height*Math.sin(2*Math.PI*b)*s*s;
     const n=normal.map((value,i)=>value-du*u[i]-dv*v[i]),length=Math.hypot(...n);
     return {p:p.map((value,i)=>value+normal[i]*lift),n:n.map(value=>value/length),uv:[a,b]};
    });
    for(let i=1;i<vertices.length-1;i++){
     const tri=[vertices[0],vertices[i],vertices[i+1]],a=new THREE.Vector3(...tri[0].p),b=new THREE.Vector3(...tri[1].p),c=new THREE.Vector3(...tri[2].p);
     const cross=new THREE.Vector3().crossVectors(b.sub(a),c.sub(a));if(cross.lengthSq()<1e-18)continue;
     if(cross.dot(new THREE.Vector3(...normal))<0)[tri[1],tri[2]]=[tri[2],tri[1]];
     for(const vertex of tri){positions.push(...vertex.p);normals.push(...vertex.n);uvs.push(...vertex.uv);}
    }
   }
  }
  rooms.add(roomId);surfaces++;
 }
 return {
  wall(poly,normal,roomId){surface(poly.map(p=>p.slice(0,3)),[normal[0],0,normal[1]],roomId);},
  mesh(){
   for(const room of floor.rooms.filter(r=>ROOM_USES[floor.id]?.[r.id]==='paddedCell')){
    // These four rectangular cells meet their actual 90mm wall faces. The
    // thin soft floor stays flush enough for the existing walking elevation.
    const xs=room.points.map(p=>p[0]),zs=room.points.map(p=>p[1]),left=Math.min(...xs)+.09,right=Math.max(...xs)-.09,bottom=Math.min(...zs)+.09,top=Math.max(...zs)-.09;
    surface([[left,.002,bottom],[right,.002,bottom],[right,.002,top],[left,.002,top]],[0,1,0],room.id,true);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
   geometry.computeBoundingBox();geometry.computeBoundingSphere();geometry.userData={rooms:[...rooms],surfaces,wallDepth:CELL_PAD_DEPTH};
   const mesh=new THREE.Mesh(geometry,cellPaddingMaterial(THREE));mesh.name='Asylum Cell Padding';return mesh;
  }
 };
}
export function createCellMattressModel(THREE){
 // One low soft mattress, with no rigid bed frame or loose storage.
 const geometry=new THREE.BoxGeometry(.92,.18,1.90,8,4,16),p=geometry.attributes.position;
 const half=[.46,.09,.95],radius=.07;
 for(let i=0;i<p.count;i++){
  const point=[p.getX(i),p.getY(i),p.getZ(i)],inner=point.map((v,k)=>Math.max(-half[k]+radius,Math.min(half[k]-radius,v))),delta=point.map((v,k)=>v-inner[k]),length=Math.hypot(...delta);
  p.setXYZ(i,...inner.map((v,k)=>v+delta[k]*radius/length));
 }
 geometry.translate(0,.09,0);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 return [{geometry,material:cellPaddingMaterial(THREE)}];
}
