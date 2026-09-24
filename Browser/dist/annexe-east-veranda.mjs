// User-marked road-facing recess; Grafton's open slate veranda supplies the
// canopy/posts vocabulary, with the annexe's existing blue timber trim.
export function addAnnexeEastVeranda(THREE,{parent,scale,roof,material,worldUV}){
 const group=new THREE.Group();group.name='East outer veranda';parent.add(group);
 const wall=109*scale,front=115.5*scale,start=-15*scale,end=4*scale;
 const high=4.25,low=3.08,depth=front-wall,length=end-start;
 const timber=material(0x4e5754),pale=material(0xb6b6a8),blue=material(0x285575),stone=material(0x989a91);
 function mesh(g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.name='East veranda '+name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function box(m,x,y,z,w,h,d,name){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
 const canopyMaterial=roof.clone();canopyMaterial.side=THREE.DoubleSide;
 const canopy=box(canopyMaterial,(wall+front)/2,(high+low)/2,(start+end)/2,Math.hypot(depth,high-low)+.22,.12,length+.18,'slate canopy');
 canopy.rotation.z=-Math.atan2(high-low,depth);worldUV(canopy.geometry,2.5);
 box(stone,(wall+front)/2,.08,(start+end)/2,depth+.55,.16,length,'paving');
 box(blue,front,low-.08,(start+end)/2,.18,.2,length,'front gutter');
 box(pale,front,low-.24,(start+end)/2,.14,.12,length,'fascia');
 box(timber,wall+.12,high-.16,(start+end)/2,.17,.22,length,'wall plate');
 const count=Math.ceil(length/4),posts=[];
 function brace(a,b){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),delta=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(.045,.045,delta.length(),6),timber,...p.add(q).multiplyScalar(.5).toArray(),'post brace');o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
 for(let i=0;i<=count;i++){
  const z=start+.25+(length-.5)*i/count;posts.push([front,z]);
  box(timber,front,low/2,z,.28,low,.28,'timber post').userData.orientedCollision=true;
  box(stone,front,.4,z,.5,.8,.5,'post base').userData.orientedCollision=true;
  for(const sign of [-1,1])if(i+sign>=0&&i+sign<=count)brace([front,low-.75,z],[front,low-.13,z+sign*.55]);
 }
 // Existing projecting rooms close both ends; the long front stays open.
 // Construction precedes normal batching, shadows and walking obstacles.
 group.userData={wall,front,start,end,high,low,posts};
 return group;
}
