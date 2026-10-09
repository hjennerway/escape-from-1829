import {IRBY_CORRIDOR as source} from './irby-corridor.mjs';

const threshold={width:2.04,depth:.62,offset:.1};

// The stone top and concrete are both at Y=.04. End the concrete at the
// threshold's footprint so only one surface owns each visible floor point.
export function irbyFloorBoundaries(boundaries,[x,z]){
 const half=threshold.width/2,innerX=x+threshold.offset-threshold.depth/2;
 return boundaries.map(points=>points.flatMap((a,i)=>{
  const b=points[(i+1)%points.length];
  if(Math.abs(a[0]-x)>1e-5||Math.abs(b[0]-x)>1e-5||Math.min(a[1],b[1])>z-half||Math.max(a[1],b[1])<z+half)return [a];
  const [near,far]=a[1]<b[1]?[z-half,z+half]:[z+half,z-half];
  return [a,[x,near],[innerX,near],[innerX,far],[x,far]];
 }));
}

// The photographed green door remains on the estate's exposed east end.
// Its straight passage and replacement roof share the Explore ceiling height.
export function addExploreIrbyEntrance(THREE,{group,resources,gallery,entrance,brick,roof,finish,box,panel,material}){
 const [x,z]=entrance.point,half=source.width/2,innerHalf=(gallery.maxX-gallery.minX)/2;
 const width=1.58,base=.04,head=2.86,height=head-base-.025,eave=gallery.height+.06,top=eave+source.rise;
 const roofY=offset=>top-source.rise*Math.abs(offset)/(half+.22);
 const parent=new THREE.Group();parent.name='Explore Irby corridor entrance';parent.position.set(x,0,z);parent.rotation.y=Math.PI/2;group.add(parent);
 const timber=material(0x3f504f),paint=material(0xd5d8ce),stone=material(0xc8c6b7),glass=material(0x536c72,{roughness:.52,metalness:.12});
 function face(points,triangles,mat,name){
  const geometry=new THREE.BufferGeometry(),vertices=triangles.flatMap(t=>t.flatMap(i=>points[i]));
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(triangles.flatMap(t=>t.flatMap(i=>mat===brick?[(points[i][2]-z)/1.7,points[i][1]/1.7]:[(points[i][0]-source.start[0])/2.8,(points[i][2]-z+points[i][1])/2.8])),2));
  geometry.computeVertexNormals();resources.add(geometry);
  const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.noWalkingCollision=true;group.add(mesh);return mesh;
 }
 function masonry(a,b,bottom,upper,name,collision=true,thickness=.24){
  const mesh=panel(a,b,bottom,upper,brick,name,collision,thickness),p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
  mesh.updateMatrix();const v=new THREE.Vector3(),alongX=Math.abs(b[0]-a[0])>Math.abs(b[1]-a[1]);
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrix);uv.setXY(i,(alongX?v.x-source.start[0]:v.z-z)/1.7,v.y/1.7);}
 }
 // Rebuild the full roof, not just a raised skirt beside the old low gable.
 for(const [a,b] of [[-half-.22,0],[0,half+.22]])face([[source.start[0],roofY(a),z+a],[x+.34,roofY(a),z+a],[x+.34,roofY(b),z+b],[source.start[0],roofY(b),z+b]],[[0,2,1],[0,3,2]],roof,'Explore Irby continuous slate roof');
 box(material(0x895040),[x-source.start[0]+.34,.13,.18],[(source.start[0]+x+.34)/2,top+.04,z],'Explore Irby roof ridge');
 for(const side of [-1,1]){
  const edge=z+side*half;
  masonry([source.start[0],edge],[x,edge],source.height,roofY(half),'Irby roof side masonry return',false,.08);
  const a=z+side*(width/2+.06),b=z+side*half;
  masonry([x+.12,Math.min(a,b)],[x+.12,Math.max(a,b)],-.18,gallery.height,'Irby entrance exterior masonry');
  panel([x-.05,z+side*(width/2+.06)],[x-.05,z+side*innerHalf],.04,gallery.ceiling-.05,finish,'Irby entrance inner jamb wall');
 }
 masonry([x+.12,z-width/2-.06],[x+.12,z+width/2+.06],head,gallery.height,'Irby entrance exterior header');
 panel([x-.05,z-width/2-.06],[x-.05,z+width/2+.06],head,gallery.ceiling-.05,finish,'Irby entrance inner header');
 face([[x+.24,gallery.height,z-half],[x+.24,gallery.height,z+half],[x+.24,roofY(half),z+half],[x+.24,top,z],[x+.24,roofY(half),z-half]],[[0,3,1],[1,3,2],[0,4,3]],brick,'Irby entrance closed roof gable');
 for(const side of [-1,1]){
  const jamb=box(paint,[.12,head,.32],[side*.85,head/2,.1],'Irby entrance door jamb',parent);jamb.userData.noWalkingCollision=false;jamb.userData.walkBarrier=true;
  // Stops overlap the shut leaf's clearance on the exterior side. The door
  // swings inward away from them, while angled views cannot see past its edge.
  box(paint,[.08,head,.032],[side*.785,head/2,.152],'Irby entrance jamb stop',parent);
 }
 box(stone,[2.08,.20,.34],[0,2.95,.1],'Irby entrance door lintel',parent);
 box(paint,[width+.24,.10,.18],[0,head-.04,.1],'Irby entrance head rebate',parent);
 box(stone,[threshold.width,.08,threshold.depth],[0,0,threshold.offset],'Irby entrance level threshold',parent);
 const pivot=new THREE.Group();pivot.name='Irby green opening door';pivot.position.set(-width/2,base,.1);parent.add(pivot);
 // The glass is set in the leaf's upper panel; the original two-pane rhythm,
 // pale bars and green lower panel stay legible from either approach.
 const leaf=box(timber,[width-.025,height,.064],[(width-.025)/2,height/2,0],'Irby green door leaf',pivot);
 for(const side of [-1,1]){
  box(glass,[1.30,.90,.012],[width/2,2.06,side*.04],'Irby door upper glazing',pivot);
  for(const sx of [-.65,0,.65])box(paint,[.055,1,.045],[width/2+sx,2.06,side*.055],'Irby door glazing stile',pivot);
  for(const y of [1.58,2.54])box(paint,[1.35,.065,.045],[width/2,y,side*.055],'Irby door glazing rail',pivot);
  box(stone,[.045,.23,.08],[width-.17,1.34,side*.09],'Irby door handle',pivot);
 }
 return {...entrance,x,z,y:1.35,pivot,leaf,side:1,approach:[1,0]};
}
