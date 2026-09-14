// Photo/video-based tower; placement follows the red square in scale.png.
// Height includes the finial; the main entrance pediment reaches 17.75 units.
export const ESCAPE_WATER_TOWER=Object.freeze({x:150,z:-53,height:17.75*2.2,width:10.2});
export function createWaterTower(THREE,{brick,roof,dark,worldUV}){
  const tower=new THREE.Group();tower.name='Water tower · rear-right clearing';
  tower.position.set(ESCAPE_WATER_TOWER.x,0,ESCAPE_WATER_TOWER.z);
  const masonry=brick.clone();masonry.color.set(0xbda18b);
  const recessed=brick.clone();recessed.color.set(0x927c65);
  const dress=brick.clone();dress.color.set(0x9f7861);
  const cap=roof.clone();cap.color.set(0x9b8c7b);
  function mesh(g,m,x,y,z,parent=tower){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(m,x,y,z,w,h,d,parent=tower){return mesh(worldUV(new THREE.BoxGeometry(w,h,d)),m,x,y,z,parent);}
  function arch(w,spring){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,spring);s.absarc(0,spring,w/2,0,Math.PI,false);s.closePath();return s;}
  function ring(radius,thickness,x,y,z,parent){
    const s=new THREE.Shape();s.absarc(0,0,radius,0,Math.PI,false);s.lineTo(-radius+thickness,0);s.absarc(0,0,radius-thickness,Math.PI,0,true);s.closePath();
    mesh(worldUV(new THREE.ExtrudeGeometry(s,{depth:.16,bevelEnabled:false,curveSegments:24})),dress,x,y,z,parent);
  }
  box(masonry,0,16.9,0,10.2,33.8,10.2);
  box(dress,0,.35,0,10.65,.7,10.65);
  for(const y of [1.05,13.3,28.6,33.15])box(dress,0,y,0,10.48,.22,10.48);
  // Four matching elevations: tall blind arcade, paired slit windows and
  // concentric round brick arches, as visible in the close-up video.
  for(let side=0;side<4;side++){
    const face=new THREE.Group();face.rotation.y=side*Math.PI/2;tower.add(face);
    mesh(new THREE.ShapeGeometry(arch(7.6,14.9)),recessed,0,13.6,5.105,face);
    for(const x of [-4.65,4.65])box(dress,x,23.2,5.19,.72,19.6,.3,face);
    for(const x of [-3.58,3.58])box(dress,x,21.15,5.27,.32,15.1,.32,face);
    for(const [r,t,z] of [[3.95,.3,5.19],[3.53,.22,5.3],[3.17,.2,5.36]])ring(r,t,0,28.5,z,face);
    box(dark,0,28.48,5.36,10.35,.12,.15,face);
    // Narrow paired recesses rise into small round heads under the big arch.
    for(const x of [-1.12,1.12]){
      mesh(new THREE.ShapeGeometry(arch(1.38,14.7)),dress,x,13.65,5.29,face);
      ring(.8,.22,x,28.35,5.43,face);
      for(const y of [16.2,21.1,26.2,28.2]){
        mesh(new THREE.ShapeGeometry(arch(.46,y===28.2?.5:1.38)),dark,x,y,5.47,face);
        box(dress,x,y-.08,5.49,.72,.15,.22,face);
      }
    }
    // Repeated corbels support the deep, overhanging roof cornice.
    for(let x=-4.6;x<4.7;x+=.84){box(dress,x,32.5,5.3,.4,.65,.45,face);box(dress,x,32.87,5.43,.58,.18,.6,face);}
  }
  // Ground-level arched doorway, with weathered stone surround.
  const stone=new THREE.MeshStandardMaterial({color:0x827e69,roughness:1});
  mesh(new THREE.ShapeGeometry(arch(2.5,3)),stone,0,.45,5.35);
  mesh(new THREE.ShapeGeometry(arch(1.85,2.8)),dark,0,.45,5.39);
  box(stone,0,.15,5.8,3.1,.3,1.55);
  for(const x of [-.65,-.32,0,.32,.65])box(dress,x,1.8,5.44,.045,2.7,.04);
  box(dress,0,33.55,0,10.9,.35,10.9);box(dark,0,33.84,0,11.6,.23,11.6);
  // Square pyramidal tiled roof; UVs keep the shared slate texture in scale.
  const positions=[],uv=[],a=6.05,eave=33.96,peak=38.25;
  const corners=[[-a,eave,-a],[-a,eave,a],[a,eave,a],[a,eave,-a]];
  for(let i=0;i<4;i++)for(const p of [corners[i],corners[(i+1)%4],[0,peak,0]]){positions.push(...p);uv.push(p[0]/3,(p[2]+p[1])/3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();mesh(g,cap,0,0,0);
  mesh(new THREE.CylinderGeometry(.09,.17,.6,8),dark,0,38.55,0);
  mesh(new THREE.SphereGeometry(.13,8,6),dark,0,38.92,0);
  return tower;
}
