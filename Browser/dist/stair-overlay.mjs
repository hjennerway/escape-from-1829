import {stairShape,stairConnection,stairFlights,stairLandingPolygons,stairFlightGeometry,STAIR_WIDTH} from './asylum-stairs.mjs';
import {existsInYear} from './estate-periods.mjs';

// An independent render pass reveals stair surfaces through walls and roofs.
// Retained batch sources supply the same positions in source and compiled scenes.
export function createStairOverlay(THREE,exterior,{floors,stairs=floors.flatMap(floor=>floor.stairs??[])}){
 const scene=new THREE.Scene(),parts=[],interior=[];
 const material=color=>new THREE.MeshBasicMaterial({color,transparent:true,opacity:.38,depthTest:false,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
 const outsideMaterial=material(0x54e8ff),insideMaterial=material(0xffa852);
 const instance=new THREE.Matrix4(),matrix=new THREE.Matrix4(),box=new THREE.Box3(),size=new THREE.Vector3();
 exterior.scene.updateMatrixWorld(true);
 const guards=[];
 exterior.model.traverse(object=>{
  if(object.userData.stairGuard&&!object.userData.aerialBatch){
   // Guard geometry includes the rail height. Expand around its tread edge to
   // find unnamed iron flights/decks without selecting nearby wall/roof bands.
   const bounds=new THREE.Box3().setFromObject(object);bounds.min.y-=.3;
   bounds.min.x-=1;bounds.max.x+=1;bounds.min.z-=1;bounds.max.z+=1;
   guards.push({bounds,material:object.material});
  }
 });
 const plane=new THREE.PlaneGeometry(1,1);plane.rotateX(-Math.PI/2);
 exterior.model.traverse(source=>{
  if(!source.isMesh||source.userData.aerialBatch||/parapet|coping|nosing|riser|chimney|roof|path|ground contact|step approach/i.test(source.name))return;
  const geometry=source.geometry;if(!geometry.boundingBox)geometry.computeBoundingBox();
  const local=geometry.boundingBox;local.getSize(size);
  if(size.x<.18||size.z<.18)return;
  const named=/\b(?:tread|step|landing)\b/i.test(source.name);
  for(let i=0;i<(source.isInstancedMesh?source.count:1);i++){
   matrix.copy(source.matrixWorld);if(source.isInstancedMesh){source.getMatrixAt(i,instance);matrix.multiply(instance);}
   box.copy(local).applyMatrix4(matrix);
   const unnamed=!source.name&&box.max.y-box.min.y<=.2&&box.max.x-box.min.x>=.18&&box.max.z-box.min.z>=.18&&guards.some(guard=>guard.material===source.material&&guard.bounds.intersectsBox(box));
   if(!named&&!unnamed)continue;
   // A single top face avoids piling translucent solid tread bases together.
   const top=new THREE.Matrix4().compose(new THREE.Vector3((local.min.x+local.max.x)/2,local.max.y+.025,(local.min.z+local.max.z)/2),new THREE.Quaternion(),new THREE.Vector3(size.x,1,size.z));
   const mesh=new THREE.Mesh(plane,outsideMaterial);mesh.name=source.name||'Exterior stair surface';mesh.matrixAutoUpdate=false;
   scene.add(mesh);parts.push({source,mesh,top,index:source.isInstancedMesh?i:null});
  }
 });
 const seen=new Set();
 for(const stair of stairs)for(const [lower,upper] of stair.connections){
  const key=stair.id+':'+lower+':'+upper;if(seen.has(key))continue;seen.add(key);
  const connection=stairConnection(stair,lower,upper);
  const a=floors.find(floor=>floor.id===lower).elevation,b=floors.find(floor=>floor.id===upper).elevation,mid=(a+b)/2,s=stairShape(stair);
  const group=new THREE.Group();group.name='Interior staircase '+key;scene.add(group);
  for(const [p,q] of stairFlights(connection,a,b))group.add(new THREE.Mesh(stairFlightGeometry(THREE,p[0],STAIR_WIDTH,p[2],q[2],p[1],q[1],Math.ceil((q[1]-p[1])/.18),q[0]),insideMaterial));
  if(connection.straightFlight){interior.push({group,section:'1829'});continue;}
  const polygons=stairLandingPolygons(connection);
  for(const [z0,z1,y] of [[s.minZ,s.front,a],[s.back,s.maxZ,mid],[s.minZ,s.front,b]]){
   if(polygons.length&&y===mid)continue;
   const mesh=new THREE.Mesh(plane,insideMaterial);mesh.position.set((s.minX+s.maxX)/2,y+.025,(z0+z1)/2);mesh.scale.set(s.maxX-s.minX,1,z1-z0);group.add(mesh);
  }
  for(const [i,points] of polygons.entries()){
   const geometry=new THREE.ShapeGeometry(new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))));geometry.rotateX(-Math.PI/2);
   const mesh=new THREE.Mesh(geometry,insideMaterial);mesh.position.y=(i===0?mid:b)+.025;group.add(mesh);
  }
  // All four staircase footprints in the current plan are in the original core.
  interior.push({group,section:'1829'});
 }
 function visible(source){for(let object=source;object;object=object.parent)if(!object.visible&&!object.userData.aerialBatchSource)return false;return true;}
 function update(){
  for(const {source,mesh,top,index} of parts){
   mesh.visible=visible(source);if(!mesh.visible)continue;
   source.updateWorldMatrix(true,false);mesh.matrix.copy(source.matrixWorld);
   if(index!==null){source.getMatrixAt(index,instance);mesh.matrix.multiply(instance);}
   mesh.matrix.multiply(top);mesh.matrixWorldNeedsUpdate=true;
  }
  for(const {group,section} of interior)group.visible=existsInYear(section,exterior.timeline?.period.year??1916);
 }
 return {scene,parts,interior,update,render(renderer,camera){
  update();const autoClear=renderer.autoClear;renderer.autoClear=false;
  try{renderer.render(scene,camera);}finally{renderer.autoClear=autoClear;}
 }};
}
