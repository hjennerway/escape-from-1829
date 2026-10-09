import {ADMIN_FRONT_CORRIDOR} from './admin-front-corridor.mjs';

// The walking rooms occupy a narrower footprint than the original stores.
// Replace their redundant roof decks and trim together, keeping the originals
// available to restore the unmodified estate when the walking interior closes.
export function fitWorkshopYardRoofs(THREE,{tower,resources,removed,remainders,left,right,west}){
 const front=tower.getObjectByName('West stores flat front flat roof');
 const corner=tower.getObjectByName('Low west stores south flat return');
 const brick=tower.getObjectByName('Low west stores east parapet')?.material;
 const stone=tower.getObjectByName('Low west stores east coping')?.material;
 if(!front||!corner||!brick||!stone)return;
 const obsolete=[];
 tower.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&(
  o===front||o===corner||/^Western tower flat link (?:flat roof|\w+ parapet|\w+ coping)$/.test(o.name)||
  /^Low west stores east (?:parapet|coping)$/.test(o.name)||
  /^West stores flat front stepped (?:parapet|coping)$/.test(o.name)))obsolete.push(o);});
 for(const o of obsolete){removed.push([o,o.parent]);o.removeFromParent();}
 function mesh(geometry,material,name){
  resources.add(geometry);const part=new THREE.Mesh(geometry,material);part.name=name;
  part.castShadow=part.receiveShadow=true;part.userData.noWalkingCollision=true;
  tower.add(part);remainders.push(part);return part;
 }
 function slab(points,material,name){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:false});geometry.rotateX(-Math.PI/2);geometry.translate(0,8.84,0);
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>Math.abs(n.getZ(i))?p.getZ(i):p.getX(i))/1.7,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/1.7);
  mesh(geometry,material,name);
 }
 const outline=[[west,-36.3],[right,-36.3],[right,-16.6],[left,-16.6],[left,-26.6],[west,-26.6]];
 slab(outline,front.material,'Walking stores fitted front flat roof');
 slab([[149.7,-40.5],[right,-40.5],[right,-36.3],[149.7,-36.3]],corner.material,'Walking stores fitted corner flat roof');
 // Copings follow the same exposed outline, with no divider between decks.
 const edges=[[[right,-40.5],[right,-16.6]],...outline.slice(2).map((a,i)=>[a,outline[(i+3)%outline.length]])];
 for(const [a,b] of edges){
  const alongX=a[1]===b[1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(const [material,width,height,y,label] of [[brick,.25,.45,9.1,'parapet'],[stone,.38,.12,9.34,'coping']]){
   const part=mesh(new THREE.BoxGeometry(alongX?length:width,height,alongX?width:length),material,'Walking stores fitted '+label);
   part.position.set((a[0]+b[0])/2,y,(a[1]+b[1])/2);
  }
 }
 // The shaped slate's south eave sits at 9, above the 8.84 wall top.
 // Its original infill begins at X=158.2, leaving the gallery corner open.
 const masonry=tower.getObjectByName('East range eaves infill')?.material;
 if(masonry){const part=mesh(new THREE.BoxGeometry(158.2-right,.16,.08),masonry,'Walking stores south slate eave closure');part.position.set((right+158.2)/2,8.92,-40.54);}
}

// The narrowed gallery leaves the original cross-corridor's east bay open.
// Close it on the pavilion's north face, with a roof meeting the retained
// entrance pitch. The original estate remains available for exact restoration.
export function closeWorkshopAdminBay(THREE,{group,resources,gallery:g,roof,brick,masonry}){
 const r=ADMIN_FRONT_CORRIDOR,left=g.maxX,right=r.adminWallX,front=6.6,back=r.joinZ;
 const roofY=x=>g.height+.06+r.rise-r.rise*Math.abs(x-r.x)/(r.width/2+.22);
 function face(points,triangles,material,name){
  const geometry=new THREE.BufferGeometry(),vertices=triangles.flatMap(t=>t.flatMap(i=>points[i]));
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(triangles.flatMap(t=>t.flatMap(i=>material===roof?[points[i][0]/1.7,points[i][2]/1.7]:[points[i][0]/2,points[i][1]/5.05])),2));
  geometry.computeVertexNormals();resources.add(geometry);
  const part=new THREE.Mesh(geometry,material);part.name=name;part.castShadow=part.receiveShadow=true;part.userData.noWalkingCollision=true;group.add(part);
 }
 const low=roofY(right)-.025;
 masonry([left,front],[right,front],0,low,'Main/admin solid yard wall');
 for(const [z,triangles] of [[front,[[0,2,1],[0,3,2]]],[back,[[0,1,2],[0,2,3]]]])
  face([[left,low,z],[right,low,z],[right,roofY(right),z],[left,roofY(left),z]],triangles,brick,'Main/admin yard wall roof closure');
 const narrowEave=g.height+.06+.64-.64*((g.maxX-g.minX)/2)/((g.maxX-g.minX)/2+.22);
 face([[left,narrowEave,front],[left,roofY(left),front],[left,roofY(left),back],[left,narrowEave,back]],[[0,2,1],[0,3,2]],brick,'Main/admin yard wall gallery roof return');
 if(roof){
  const points=[[left,roofY(left),front],[right,roofY(right),front],[right,roofY(right),back],[left,roofY(left),back]];
  face(points,[[0,2,1],[0,3,2]],roof,'Main/admin solid yard wall slate roof');
  face(points.map(([x,y,z])=>[x,y-.025,z]),[[0,1,2],[0,2,3]],brick,'Main/admin solid yard wall roof underside');
 }
}
