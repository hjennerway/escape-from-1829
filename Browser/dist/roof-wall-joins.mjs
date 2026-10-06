// Close the underside of authored roof overhangs after all roof cuts and building
// transforms. Slate vertices stay intact; the fascia stops at the slate edge.
const supportCache=new WeakMap();
const same=(a,b)=>a===b||Boolean(a&&b&&a.length===b.length&&a.every((value,i)=>value===b[i]));
export function releaseRoofSupportCache(root){root.traverse(object=>supportCache.delete(object));}
export function closeRoofWallGaps(THREE,root,{exclude=[],cache=true}={}){
 root.updateWorldMatrix(true,true);
 const roofs=[],grid=new Map(),cellSize=8;
 const roofMaterial=o=>o.material?.userData.roofTilePixels||
  (/roof|slate canopy/i.test(o.name)&&!/rooflight|ventilator|finial|gable|coping|support|soffit|eaves|rafter|ridge/i.test(o.name));
 const key=(x,z)=>Math.floor(x/cellSize)+','+Math.floor(z/cellSize);
 const add=record=>{
  for(let x=Math.floor(record.minX/cellSize);x<=Math.floor(record.maxX/cellSize);x++)
   for(let z=Math.floor(record.minZ/cellSize);z<=Math.floor(record.maxZ/cellSize);z++){
    const k=x+','+z;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(record);
   }
 };
 const instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();let reusedMeshes=0,scannedMeshes=0;
 root.traverse(o=>{
  if(!o.isMesh||o.userData.roofWallClosure)return;
  for(let p=o;p;p=p.parent)if(exclude.includes(p))return;
  const mat=o.material;
  if(Array.isArray(mat)||mat.transparent||mat.userData.estateGrass||mat.userData.estateSurface||mat.userData.groundContactSide)return;
  const isRoof=Boolean(roofMaterial(o)),g=o.geometry,p=g.attributes.position,index=g.index;
  if(!p)return;
  const count=o.isInstancedMesh?o.count:1;
  const previous=cache?supportCache.get(o):null,instances=o.isInstancedMesh?o.instanceMatrix.array:null;
  // Compare the actual input values: builders sometimes edit vertices without
  // incrementing BufferAttribute.version, or clone them during UV finishing.
  if(previous&&previous.isRoof===isRoof&&previous.count===count&&previous.itemSize===p.itemSize&&
   same(previous.positions,p.array)&&same(previous.index,index?.array)&&same(previous.world,o.matrixWorld.elements)&&same(previous.instances,instances)){
   previous.records.forEach(add);if(isRoof&&!o.userData.roofWallJoinsFinished)roofs.push(...previous.roofs);reusedMeshes++;return;
  }
  scannedMeshes++;
  const cached={isRoof,count,itemSize:p.itemSize,positions:p.array.slice(),index:index?.array.slice(),world:o.matrixWorld.elements.slice(),instances:instances?instances.slice():null,records:[],roofs:[]};
  for(let item=0;item<count;item++){
   if(o.isInstancedMesh){o.getMatrixAt(item,instance);matrix.multiplyMatrices(o.matrixWorld,instance);}else matrix.copy(o.matrixWorld);
   const sign=Math.sign(matrix.determinant()),vertices=Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix)),edges=new Map();let solidUnderside=false;
   const vertexKey=i=>vertices[i].toArray().map(v=>Math.round(v*1e4)).join(',');
   for(let i=0;i<(index?.count??p.count);i+=3){
    const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j),[a,b,c]=ids.map(j=>vertices[j]);
    const normal=b.clone().sub(a).cross(c.clone().sub(a)).multiplyScalar(sign);
    if(normal.y<-.00001)solidUnderside=true;
    if(normal.y<.00001||(!isRoof&&normal.y<.05)||Math.max(a.y,b.y,c.y)<1.2)continue;
    normal.normalize();
    const record={a,b,c,normal,owner:o,isRoof,minX:Math.min(a.x,b.x,c.x),maxX:Math.max(a.x,b.x,c.x),minZ:Math.min(a.z,b.z,c.z),maxZ:Math.max(a.z,b.z,c.z)};
    add(record);
    cached.records.push(record);
    if(!isRoof||o.userData.roofWallJoinsFinished)continue;
    for(let j=0;j<3;j++){
     const a=ids[j],b=ids[(j+1)%3],ka=vertexKey(a),kb=vertexKey(b);if(ka===kb)continue;
     const id=ka<kb?ka+'|'+kb:kb+'|'+ka;
     if(edges.has(id))edges.get(id).count++;else edges.set(id,{a,b,c:ids[(j+2)%3],normal,count:1});
    }
   }
   if(isRoof&&!o.userData.roofWallJoinsFinished){const roof={owner:o,vertices,edges,solidUnderside};roofs.push(roof);cached.roofs.push(roof);}
  }
  if(cache)supportCache.set(o,cached);
 });
 function height(r,x,z){
  const {a,b,c}=r,den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);
  const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den;
  return u>=-1e-6&&v>=-1e-6&&u+v<=1+1e-6?a.y*u+b.y*v+c.y*(1-u-v):null;
 }
 function at(x,z,y,owner,kind){
  let best=null;
  for(const r of grid.get(key(x,z))??[]){
   if(kind==='support'?r.isRoof:kind==='otherRoof'?(!r.isRoof||r.owner===owner):r.owner!==owner)continue;
   if(x<r.minX-1e-5||x>r.maxX+1e-5||z<r.minZ-1e-5||z>r.maxZ+1e-5)continue;
   const h=height(r,x,z);if(h===null)continue;
   if(kind==='support'&&(h>y+.003||h<y-.85))continue;
   if(!best||h>best.y)best={y:h,record:r};
  }
  return best;
 }
 const report={roofs:roofs.length,boundaries:0,closed:0,unsupported:0,reusedMeshes,scannedMeshes},undersideMaterials=new Map();
 for(const {owner,vertices,edges,solidUnderside} of roofs){
  // Box/extruded roofs already have an opaque underside and closed fascia.
  if(solidUnderside){owner.userData.roofWallJoinsFinished=true;owner.userData.roofWallJoinSummary={closed:0,unsupported:0,solid:true};continue;}
  // A roof skin is also opaque from below, including valleys where another
  // roof supplies the edge join. Keep this face just inside the slate, rather
  // than making its outward face double-sided or moving the visible pitches.
  if(!undersideMaterials.has(owner.material)){
   const material=owner.material.clone();material.side=THREE.BackSide;
   undersideMaterials.set(owner.material,material);
  }
  const undersideGeometry=owner.geometry.clone(),position=undersideGeometry.attributes.position;
  const drop=new THREE.Vector3(0,-.003,0).applyMatrix3(new THREE.Matrix3().setFromMatrix4(owner.matrixWorld.clone().invert()));
  for(let i=0;i<position.count;i++)position.setXYZ(i,position.getX(i)+drop.x,position.getY(i)+drop.y,position.getZ(i)+drop.z);
  undersideGeometry.computeBoundingBox();undersideGeometry.computeBoundingSphere();
  const underside=new THREE.Mesh(undersideGeometry,undersideMaterials.get(owner.material));
  underside.position.copy(owner.position);underside.quaternion.copy(owner.quaternion);underside.scale.copy(owner.scale);
  underside.name='Roof underside: '+(owner.name||owner.parent.name);underside.userData.roofWallClosure=true;
  underside.castShadow=underside.receiveShadow=true;owner.parent.add(underside);
  const parts=new Map(),inverse=owner.parent.matrixWorld.clone().invert(),parentSign=Math.sign(owner.parent.matrixWorld.determinant());let closed=0,unsupported=0;
  function triangle(mat,a,b,c,out){
   if(b.clone().sub(a).cross(c.clone().sub(a)).lengthSq()<1e-14)return;
   // Three.js reverses front-face winding for mirrored parents. Match that
   // convention before returning these world-space vertices to the parent.
   if(b.clone().sub(a).cross(c.clone().sub(a)).dot(out)*parentSign<0)[b,c]=[c,b];
   if(!parts.has(mat))parts.set(mat,[]);
   for(const v of [a,b,c])parts.get(mat).push(...v.clone().applyMatrix4(inverse));
  }
  function quad(mat,a,b,c,d,out){triangle(mat,a,b,c,out);triangle(mat,a,c,d,out);}
  for(const edge of edges.values()){
   if(edge.count!==1)continue;
   const a=vertices[edge.a],b=vertices[edge.b],delta=b.clone().sub(a),length=Math.hypot(delta.x,delta.z);
   if(length<.0001)continue;report.boundaries++;
   const along=delta.clone().setY(0).normalize(),inside=new THREE.Vector3(-along.z,0,along.x);
   if(inside.dot(vertices[edge.c].clone().sub(a))<0)inside.negate();
   const steps=Math.max(1,Math.ceil(length/.5));
   let pending;
   function finishSpan(){
    if(!pending)return;
    const {mat,outer,lower,bottom,upper}=pending;
    quad(mat,outer[0],outer[1],lower[1],lower[0],inside.clone().negate());
    quad(mat,lower[0],lower[1],bottom[1],bottom[0],new THREE.Vector3(0,-1,0));
    quad(mat,bottom[0],bottom[1],upper[1],upper[0],inside);
    quad(mat,outer[0],lower[0],bottom[0],upper[0],along.clone().negate());
    quad(mat,outer[1],lower[1],bottom[1],upper[1],along);
    pending=null;
   }
   for(let step=0;step<steps;step++){
    const from=a.clone().lerp(b,step/steps),to=a.clone().lerp(b,(step+1)/steps),mid=from.clone().lerp(to,.5);
    // Shared seams and buried edges are already enclosed by adjoining slate.
    const adjacent=at(mid.x,mid.z,mid.y,owner,'otherRoof');
    if(adjacent&&adjacent.y>=mid.y-.012){finishSpan();continue;}
    let support,inset;
    for(const distance of [0,.025,.075,.15,.25,.4,.6,.85,1.1]){
     const q=mid.clone().addScaledVector(inside,distance),hit=at(q.x,q.z,mid.y,owner,'support');
     if(hit){support=hit;inset=distance;break;}
    }
    if(!support){report.unsupported++;unsupported++;finishSpan();continue;}
    if(inset<=.025&&support.y>=mid.y-.012){finishSpan();continue;}
    const r=support.record,mat=r.owner.material,width=Math.max(.04,inset+.035);
    // Follow the actual support plane, including sloping gable/lean-to tops.
    const supportY=p=>r.a.y-(r.normal.x*(p.x-r.a.x)+r.normal.z*(p.z-r.a.z))/r.normal.y;
    const outer=[from,to],inner=outer.map(p=>p.clone().addScaledVector(inside,width));
    const lower=outer.map((p,i)=>p.clone().setY(Math.min(p.y-.035,supportY(inner[i])-.015)));
    const bottom=inner.map((p,i)=>p.clone().setY(lower[i].y));
    const upper=inner.map(p=>{
     const h=at(p.x,p.z,p.y,owner,'ownRoof');
     return p.clone().setY(Math.min(h?.y??p.y,p.y-(edge.normal.x*(p.x-from.x)+edge.normal.z*(p.z-from.z))/edge.normal.y)-.001);
    });
    // End caps are beneath the roof. They close short hip corners as well as
    // long eaves without extending slate through a rendered cornice.
    const signature=[mat.id,width,...r.normal.toArray(),r.normal.dot(r.a)].map(v=>Math.round(v*1e4)).join(',');
    if(pending?.signature===signature){
     for(const name of ['outer','lower','bottom','upper'])pending[name][1]=({outer,lower,bottom,upper})[name][1];
    }else{finishSpan();pending={signature,mat,outer,lower,bottom,upper};}
    closed++;report.closed++;
   }
   finishSpan();
  }
  for(const [material,positions] of parts){
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
   const p=geometry.attributes.position,n=geometry.attributes.normal,uv=[];
   for(let i=0;i<p.count;i++)uv.push((Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/1.7,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/1.7);
   geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
   const closure=new THREE.Mesh(geometry,material);
   closure.name='Eave closure: '+(owner.name||owner.parent.name).replace(/\b(?:slate|roof)\b/gi,'').replace(/\s+/g,' ').trim();
   closure.userData.roofWallClosure=true;closure.castShadow=closure.receiveShadow=true;owner.parent.add(closure);
  }
  owner.userData.roofWallJoinsFinished=true;
  owner.userData.roofWallJoinSummary={closed,unsupported};
 }
 return report;
}
